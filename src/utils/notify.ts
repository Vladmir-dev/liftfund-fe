import { Notify } from 'notiflix/build/notiflix-notify-aio'
import { Confirm } from 'notiflix/build/notiflix-confirm-aio'
import { Loading } from 'notiflix/build/notiflix-loading-aio'

// Configure Notiflix Notify to match HelpFund's brand
Notify.init({
  width: '340px',
  position: 'right-top',
  distance: '20px',
  opacity: 1,
  borderRadius: '16px',
  fontFamily: 'inherit',
  fontSize: '13px',
  cssAnimation: true,
  cssAnimationDuration: 300,
  cssAnimationStyle: 'from-top',
  useIcon: true,
  fontAwesomeIconStyle: 'basic',
  fontAwesomeIconSize: '16px',
  timeout: 3500,
  showOnlyTheLastOne: false,
  clickToClose: true,
  pauseOnHover: true,
  success: {
    background: '#024731',
    textColor: '#ffffff',
    childClassName: 'notiflix-notify-success',
    notiflixIconColor: '#bbf770',
  },
  failure: {
    background: '#991b1b',
    textColor: '#ffffff',
    childClassName: 'notiflix-notify-failure',
    notiflixIconColor: '#fecaca',
  },
  warning: {
    background: '#854d0e',
    textColor: '#ffffff',
    childClassName: 'notiflix-notify-warning',
    notiflixIconColor: '#fef08a',
  },
  info: {
    background: '#0f172a',
    textColor: '#ffffff',
    childClassName: 'notiflix-notify-info',
    notiflixIconColor: '#38bdf8',
  },
})

// Configure Notiflix Confirm to match HelpFund's design system
Confirm.init({
  className: 'notiflix-confirm',
  width: '380px',
  zindex: 99999,
  position: 'center',
  distance: '10px',
  backgroundColor: '#ffffff',
  borderRadius: '24px',
  backOverlay: true,
  backOverlayColor: 'rgba(15, 23, 42, 0.6)',
  rtl: false,
  fontFamily: 'inherit',
  cssAnimation: true,
  cssAnimationDuration: 300,
  cssAnimationStyle: 'zoom',
  plainText: true,
  titleColor: '#0f172a',
  titleFontSize: '17px',
  titleMaxLength: 60,
  messageColor: '#475569',
  messageFontSize: '13px',
  messageMaxLength: 200,
  buttonsFontSize: '13px',
  buttonsMaxLength: 34,
  okButtonColor: '#ffffff',
  okButtonBackground: '#dc2626',
  cancelButtonColor: '#475569',
  cancelButtonBackground: '#f1f5f9',
})

export { Notify, Confirm, Loading }
