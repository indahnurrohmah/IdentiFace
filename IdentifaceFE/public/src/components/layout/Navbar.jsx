export default function Navbar({ userName = 'User' }) {
  return (
    <nav className="navbar">
      <div className="navbar-left">
        <div className="navbar-brand">
          <div className="navbar-logo">IF</div>
          <span>IdentiFace</span>
        </div>
      </div>

      <div className="navbar-right">
        <div className="navbar-user">
          <span className="navbar-username">{userName}</span>
          <div className="navbar-avatar">{userName.charAt(0)}</div>
        </div>
      </div>
    </nav>
  )
}
