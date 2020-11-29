import Div100vh from "react-div-100vh";
import Modal, { ModalBody } from "../src/components/ui/modal";

export default function FailedToLoadFlight() {
  return (
    <Div100vh className="bg-yellow-100">
      <Modal isOpen={true} onClose={() => {}}>
        <ModalBody>
          <div>
            <h1 className="text-xl font-semibold mb-4">
              Flight could not be loaded.
            </h1>
            <div className="mt-4">
              <span className="text-gray-700">
                You can manually upload a flight{" "}
                <a href="/" className="text-primary">
                  here
                </a>
                .
              </span>
            </div>
          </div>
        </ModalBody>
      </Modal>
    </Div100vh>
  );
}
