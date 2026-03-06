"""
Anomaly Detection Model
Loads pre-trained Isolation Forest from trained_models/anomaly_model.pkl
"""

import numpy as np
import pickle
import os
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
from datetime import datetime


class AnomalyDetector:

    def __init__(self):
        self.model = None
        self.scaler = None
        self.is_pretrained = False
        self._load_model()

    def _load_model(self):
        path = "trained_models/anomaly_model.pkl"
        if os.path.exists(path):
            with open(path, "rb") as f:
                data = pickle.load(f)
            self.model = data["model"]
            self.scaler = data["scaler"]
            self.is_pretrained = True
            print(f"[AnomalyDetector] Loaded pre-trained model (trained: {data.get('trained_at', 'unknown')})")
        else:
            print("[AnomalyDetector] WARNING: No trained model found! Run: python train_anomaly_model.py")
            self.model = IsolationForest(contamination=0.13, n_estimators=100, random_state=42)
            self.scaler = StandardScaler()

    def _extract_features(self, transactions):
        """Convert transactions to 9 numerical features — MUST match training"""
        features = []
        for txn in transactions:
            amount = txn['amount']

            try:
                date = datetime.strptime(txn['date'], '%Y-%m-%d')
                day = date.day
                month = date.month
            except (ValueError, KeyError):
                day = 15
                month = 6

            amount_log = float(np.log1p(amount))
            is_round = 1 if (amount >= 50 and amount % 50 == 0) else 0
            is_march = 1 if month == 3 else 0
            is_month_end = 1 if day >= 25 else 0

            near_threshold = 0
            for t in [10, 50, 100]:
                if t * 0.90 <= amount < t:
                    near_threshold = 1
                    break

            dept_code = hash(txn.get('department', '')) % 20

            features.append([
                amount,
                amount_log,
                day,
                month,
                is_round,
                is_march,
                is_month_end,
                near_threshold,
                dept_code,
            ])

        return np.array(features)

    def _apply_rules(self, txn, mean_amt, std_amt):
        """Domain-specific fraud detection rules"""
        score = 0.0
        reasons = []
        amount = txn['amount']

        # Rule 1: Statistical outlier
        if std_amt > 0 and amount > mean_amt + 2 * std_amt:
            factor = round(amount / mean_amt, 1)
            score += 0.35
            reasons.append(f"Amount Rs.{amount}Cr is {factor}x the average (Rs.{round(mean_amt, 1)}Cr)")

        # Rule 2: Round amount
        if amount >= 50 and amount % 50 == 0:
            score += 0.15
            reasons.append(f"Suspiciously round amount: Rs.{amount}Cr")

        # Rule 3: March year-end
        try:
            date = datetime.strptime(txn.get('date', ''), '%Y-%m-%d')
            if date.month == 3:
                score += 0.25
                reasons.append("March transaction — year-end budget dumping risk")
                if date.day >= 25:
                    score += 0.15
                    reasons.append("Last week of March — highest fraud risk period")
        except ValueError:
            pass

        # Rule 4: Near audit threshold
        for threshold in [10, 50, 100]:
            if threshold * 0.90 <= amount < threshold:
                score += 0.2
                reasons.append(f"Just below Rs.{threshold}Cr audit threshold — possible structuring")

        # Rule 5: Urgent procurement
        desc = txn.get('description', '').lower()
        if 'urgent' in desc or 'emergency' in desc:
            score += 0.1
            reasons.append("Marked 'urgent' — may bypass normal approval process")

        if not reasons:
            reasons.append("Evaluated by ML statistical model")

        return min(1.0, score), reasons

    def _get_severity(self, score):
        if score >= 0.85:
            return "critical"
        elif score >= 0.65:
            return "high"
        elif score >= 0.45:
            return "medium"
        return "low"

    def detect(self, transactions):
        """
        Main detection function.
        Input: list of transaction dicts
        Output: list of result dicts with anomaly scores
        """

        if len(transactions) < 3:
            return self._rule_based_only(transactions)

        # LAYER 1: ML (Isolation Forest)
        features = self._extract_features(transactions)

        if self.is_pretrained:
            features_scaled = self.scaler.transform(features)
            predictions = self.model.predict(features_scaled)
            raw_scores = self.model.decision_function(features_scaled)
        else:
            features_scaled = self.scaler.fit_transform(features)
            self.model.fit(features_scaled)
            predictions = self.model.predict(features_scaled)
            raw_scores = self.model.decision_function(features_scaled)

        # Normalize ML scores to 0-1
        min_s, max_s = raw_scores.min(), raw_scores.max()
        if max_s - min_s > 0:
            ml_scores = 1 - (raw_scores - min_s) / (max_s - min_s)
        else:
            ml_scores = np.zeros(len(raw_scores))

        # LAYER 2: Rule-based
        amounts = np.array([t['amount'] for t in transactions])
        mean_amt = float(np.mean(amounts))
        std_amt = float(np.std(amounts)) if len(amounts) > 1 else 0

        results = []
        for i, txn in enumerate(transactions):
            ml_score = float(ml_scores[i])
            ml_is_anomaly = predictions[i] == -1

            rule_score, reasons = self._apply_rules(txn, mean_amt, std_amt)

            # Combine: 60% ML + 40% Rules
            final_score = min(1.0, (ml_score * 0.6) + (rule_score * 0.4))
            is_anomaly = ml_is_anomaly or final_score > 0.65

            results.append({
                "transaction_id": txn.get('id', f'TXN-{i}'),
                "department": txn.get('department', 'Unknown'),
                "amount": float(txn['amount']),
                "date": txn.get('date', ''),
                "anomaly_score": round(float(final_score), 3),
                "is_anomaly": bool(is_anomaly),
                "ml_score": round(float(ml_score), 3),
                "rule_score": round(float(rule_score), 3),
                "reasons": reasons if is_anomaly or final_score > 0.4 else ["Normal transaction"],
                "severity": self._get_severity(final_score),
            })

        results.sort(key=lambda x: x['anomaly_score'], reverse=True)
        return results

    def _rule_based_only(self, transactions):
        """Fallback when too few transactions for ML"""
        results = []
        amounts = [t['amount'] for t in transactions]
        mean_amt = float(np.mean(amounts)) if amounts else 0
        std_amt = float(np.std(amounts)) if len(amounts) > 1 else 0

        for i, txn in enumerate(transactions):
            score, reasons = self._apply_rules(txn, float(mean_amt), float(std_amt))
            results.append({
                "transaction_id": txn.get('id', f'TXN-{i}'),
                "department": txn.get('department', 'Unknown'),
                "amount": float(txn['amount']),
                "date": txn.get('date', ''),
                "anomaly_score": round(float(score), 3),
                "is_anomaly": bool(score > 0.5),
                "ml_score": 0.0,
                "rule_score": round(float(score), 3),
                "reasons": reasons,
                "severity": self._get_severity(score),
            })

        results.sort(key=lambda x: x['anomaly_score'], reverse=True)
        return results