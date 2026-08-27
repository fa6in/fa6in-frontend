import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { I18nextProvider } from "react-i18next";
import '@ant-design/v5-patch-for-react-19';

import { ToastContainer } from "react-toastify";
const queryClient = new QueryClient();
import { SnackbarProvider } from "notistack";

import i18n from "./i18n";
import Router from "./router/router";
import AppTheme from "./theme/AppTheme";

function App() {
  return (
    <I18nextProvider i18n={i18n}>
      <SnackbarProvider
       maxSnack={3}
       anchorOrigin={{ vertical: "top", horizontal: "center" }}
       autoHideDuration={3000}>
      <QueryClientProvider client={queryClient}>
        <AppTheme>
          <Router />
        </AppTheme>
        <ToastContainer />
      </QueryClientProvider>
      </SnackbarProvider>
    </I18nextProvider>
  );
}

export default App;

