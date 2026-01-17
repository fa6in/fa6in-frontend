
import Swal, { type SweetAlertResult } from 'sweetalert2'
import AuthService from './AuthService';
import { useTranslation } from 'react-i18next';



export const ALert_Retourne_Login = (): Promise<SweetAlertResult> => {
  const {t} = useTranslation()
    return new Promise((resolve) => {
      const timeoutDuration = 500;
  
      const swalPromise = Swal.fire({
        title: t('alert.message_decn'),
        color: "#141317",
        customClass: {
          loader: "Is Loading",
          confirmButton: 'custom-button'
        },
        confirmButtonColor: "#141317",
      });
  
      swalPromise.then((result) => {
        resolve(result as SweetAlertResult);
  
        if (!result.isConfirmed) {
          setTimeout(() => {
            AuthService.clearTokens();
            window.location.href = '/login';
          }, timeoutDuration);
        }
      });
    });
  };




  export const ALert_Retourne_check_cnx= (): Promise<SweetAlertResult> => {
    return new Promise((resolve) => {
  
      const swalPromise = Swal.fire({
        title: 'Vérifiez votre connexion Internet !',
        color: "#141317",
        customClass: {
          loader: "Is Loading",
          confirmButton: 'custom-button'
        },
        confirmButtonColor: "#141317",
      });
  
      swalPromise.then((result) => {
        resolve(result as SweetAlertResult);
  
        
      });
    });
  };