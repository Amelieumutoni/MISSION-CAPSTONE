import "./Navbar.css"

function Navbar() {
  return (
    <nav className="navbar">
      <h2 className="logo">Craftfolio</h2>

      <ul className="nav-links">
        <li>Explore</li>
        <li>Exhibitions</li>
        <li>Artists</li>
        <li>About</li>
        <li>Login</li>
        <button className="signup-btn">Get Started</button>
      </ul>
    </nav>
  )
}

export default Navbar
