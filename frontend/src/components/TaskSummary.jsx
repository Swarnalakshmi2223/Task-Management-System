import { FiList, FiClock, FiActivity, FiCheckCircle } from 'react-icons/fi';

// TaskSummary — 4 professional stat cards at the top of the Dashboard
function TaskSummary({ tasks }) {
  const total      = tasks.length;
  const pending    = tasks.filter((t) => t.status === 'Pending').length;
  const inProgress = tasks.filter((t) => t.status === 'In Progress').length;
  const completed  = tasks.filter((t) => t.status === 'Completed').length;

  const cards = [
    {
      label:      'Total Tasks',
      sub:        'All tasks',
      value:      total,
      colorClass: 'summary-total',
      icon:       <FiList size={18} strokeWidth={2} />,
    },
    {
      label:      'Pending',
      sub:        'Awaiting action',
      value:      pending,
      colorClass: 'summary-pending',
      icon:       <FiClock size={18} strokeWidth={2} />,
    },
    {
      label:      'In Progress',
      sub:        'Currently active',
      value:      inProgress,
      colorClass: 'summary-progress',
      icon:       <FiActivity size={18} strokeWidth={2} />,
    },
    {
      label:      'Completed',
      sub:        'Successfully done',
      value:      completed,
      colorClass: 'summary-done',
      icon:       <FiCheckCircle size={18} strokeWidth={2} />,
    },
  ];

  return (
    <div className="row g-3 mb-4">
      {cards.map((card) => (
        <div key={card.label} className="col-6 col-md-3">
          <div className={`summary-card ${card.colorClass}`}>
            <div className="summary-card-icon">
              {card.icon}
            </div>
            <div className="summary-count">{card.value}</div>
            <p className="summary-label">{card.label}</p>
            <p className="summary-sub">{card.sub}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default TaskSummary;
