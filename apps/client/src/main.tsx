import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ToastContainer } from "react-toastify";
import { RouterProvider } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { QueryCache, QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Import of Internal CSS & Styling Configurations
import "./styles/index.css";
import "./styles/tooltip.css";
import "./styles/toastify.css";
import { router } from "@/routes/routes";

const queryClient = new QueryClient({
    queryCache: new QueryCache({
        onError: (err) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            if ((err as any).statusCode === 401) {
                window.location.href = "/authentication/login";
            }
        }
    })
});

createRoot(document.getElementById("root") as HTMLElement).render(
    <StrictMode>
        <QueryClientProvider client={queryClient}>
            <HelmetProvider>
                <RouterProvider router={router} />
                <ToastContainer
                    draggable
                    newestOnTop
                    closeOnClick
                    theme="auto"
                    toastClassName=""
                    progressClassName=""
                    className="toast-hero"
                    position="bottom-right"
                    hideProgressBar={false}
                />
            </HelmetProvider>
        </QueryClientProvider>
    </StrictMode>
);
