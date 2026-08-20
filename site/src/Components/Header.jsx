import { NavLink } from "react-router";
export default function Header() {
  return (
    <header className="site-header">
      <NavLink className="site-title" to="/" data-nav-home>
        Crosswords
      </NavLink>
      <div className="site-tagline">by Kaincee</div>
      <div className="site-nav">
        <NavLink to="/login" data-nav-login>
          Login
        </NavLink>
        <NavLink to="/signup" data-nav-signup>
          Signup
        </NavLink>
      </div>
    </header>
  );
}
