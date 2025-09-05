import Navbar from '@/components/shared/navbar';
import Footer from '@/components/shared/footer';

export default function PublicLayout({ children }: { readonly children: React.ReactNode }) {
  return (
    <div className="bg-background flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 pt-20">{children}</main>
      <Footer />
    </div>
  );
}
