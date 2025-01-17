import { Navbar } from "./layout/Navbar";
import { LoadingPage } from "./LoadingPage";

interface Props {
    newUi?: boolean;
}
const LoadingPageWithNavbar = ({ newUi = true }: Props) => {
    return (
        <>
            {newUi == true ? (
                <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
                    <Navbar />
                    <LoadingPage />
                </div>
            ) : (
                <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
                    <Navbar />
                    <main className="container mx-auto px-4 py-8">
                        <div className="flex flex-col items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                            <p className="mt-4 text-slate-600">Loading...</p>
                        </div>
                    </main>
                </div>
            )}
        </>
    );
};

export default LoadingPageWithNavbar;
