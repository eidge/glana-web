import ReactModal from "react-modal";
import { use100vh } from "react-div-100vh";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  children: JSX.Element[] | JSX.Element;
}

const Modal = (props: Props) => {
  const height = use100vh();
  return (
    <ReactModal
      isOpen={props.isOpen}
      onRequestClose={props.onClose}
      ariaHideApp={false}
      className="gl-modal"
      overlayClassName="gl-modal-overlay"
    >
      {props.children}
      <style global jsx>{`
        .gl-modal {
          @apply bg-white shadow-xl rounded-lg outline-none p-4;
        }

        .gl-modal-overlay {
          @apply flex flex-row items-center justify-center;
          @apply fixed w-screen top-0 left-0;
          @apply bg-gray-500 bg-opacity-25;
          height: ${height ? `${height}px` : "100vh"};
        }
      `}</style>
    </ReactModal>
  );
};

export default Modal;
