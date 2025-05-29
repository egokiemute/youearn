import { Navbar } from "../(home)/navbar";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col w-full h-screen">
      <Navbar />
      <div className="grid lg:grid-cols-2 h-full">
        <div className="hidden lg:flex w-full bg-cover bg-center" style={{ backgroundImage: "url('/assets/auth-banner.jpg')" }}>
          <div className="hidden lg:flex items-center justify-center h-full text-colors text-2xl font-bold">
            {/* <h1 className="text-4xl">Edupay School Fees Portal</h1> */}
          </div>
        </div>
        <div className="bg-slate-100/10 flex items-center justify-center h-full px-4 lg:p-6 overflow-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
