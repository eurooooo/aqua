import { NavLink, Outlet } from "react-router";

const navItems = [
  { to: "/", label: "首页" },
  { to: "/record", label: "记录" },
  { to: "/recommend", label: "推荐" },
  { to: "/profile", label: "档案" },
];

function AppLayout() {
  return (
    <div className="min-h-screen bg-slate-50 pb-24 text-slate-900">
      <header className="mx-auto w-full max-w-5xl px-4 pt-6 pb-3 sm:px-6">
        <h1 className="text-3xl font-black tracking-tight">Aqua</h1>
        <p className="mt-1 text-sm text-slate-600">AI 饮食助手</p>
      </header>
      <main className="mx-auto w-full max-w-5xl px-4 sm:px-6">
        <Outlet />
      </main>
      <nav className="fixed right-0 bottom-0 left-0 border-t border-slate-200/90 bg-white/95 px-3 py-2 backdrop-blur">
        <div className="mx-auto grid w-full max-w-5xl grid-cols-4 gap-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className={({ isActive }) =>
              [
                "rounded-lg px-2 py-2 text-center text-sm font-semibold transition-colors",
                isActive
                  ? "bg-teal-100 text-teal-800"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
              ].join(" ")
            }
          >
            {item.label}
          </NavLink>
        ))}
        </div>
      </nav>
    </div>
  );
}

export default AppLayout;
