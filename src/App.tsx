import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { I18nextProvider } from "react-i18next";
// import '@ant-design/v5-patch-for-react-19';

import { ToastContainer } from "react-toastify";
const queryClient = new QueryClient();
// import '@ant-design/v5-patch-for-react-19';
import { SnackbarProvider } from "notistack";

import i18n from "./i18n";
import Router from "./router/router";
// import { QueryClientProvider } from "@tanstack/react-query";
function App() {
  return (
    <I18nextProvider i18n={i18n}>
      <SnackbarProvider
       maxSnack={3}
       anchorOrigin={{ vertical: "top", horizontal: "center" }}
       autoHideDuration={3000}>
      <QueryClientProvider client={queryClient}>
        {/* <ReactQueryDevtools
          initialIsOpen={false}
          buttonPosition="bottom-right"
        /> */}
        <Router />
        <ToastContainer />
      </QueryClientProvider>
      </SnackbarProvider>
    </I18nextProvider>
  );
}

export default App;

