import './Card.css';

export default function Card({ children, className = '', title, ...props }) {
    return (
        <div className={`card ${className}`} {...props}>
            {title && <div className="card-header"><h3 className="card-title">{title}</h3></div>}
            <div className="card-body">
                {children}
            </div>
        </div>
    );
}
