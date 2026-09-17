import { FiCheckSquare } from 'react-icons/fi';

// Navbar — clean white professional header, shown on every page
function Navbar() {
  return (
    <nav className="app-navbar d-flex align-items-center justify-content-between">
      {/* Brand */}
      <div className="d-flex align-items-center gap-3">
        <div className="navbar-brand-icon">
          <FiCheckSquare size={18} strokeWidth={2.5} />
        </div>
        <div>
          <div className="brand-title">TaskFlow</div>
          <div className="brand-subtitle">AI-Assisted Task Management</div>
        </div>
      </div>

      {/* Stack badge */}
      <span className="navbar-stack-badge">MERN Stack</span>
    </nav>
  );
}

export default Navbar;
