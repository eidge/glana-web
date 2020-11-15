import ReactModal from "react-modal";
import { use100vh } from "react-div-100vh";
import Button from "./button";

interface ModalProps {
  isOpen: boolean;
  onClose?: () => void;
  children: JSX.Element[] | JSX.Element;
}

const Modal = (props: ModalProps) => {
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
          @apply bg-white shadow-xl rounded-lg outline-none;
          @apply overflow-hidden overflow-y-scroll;
          max-height: ${height ? `${height}px` : "100vh"};
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

interface ModalHeaderProps {
  title?: string;
  onClose?: () => void;
}

export const ModalHeader = (props: ModalHeaderProps) => {
  return (
    <div className="bg-teal-600 p-4 pb-6 flex flex-row justify-between items-center">
      {props.title && (
        <h1 className="text-xl text-white font-semibold">{props.title}</h1>
      )}
      {props.onClose && (
        <Button
          color="primary"
          inButtonGroup={true}
          onClick={props.onClose}
          icon="close"
        />
      )}
    </div>
  );
};

interface ModalBodyProps {
  children: JSX.Element[] | JSX.Element;
}

export const ModalBody = (props: ModalBodyProps) => {
  return <div className="p-4">{props.children}</div>;
};
