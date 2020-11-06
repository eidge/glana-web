import Button, { ButtonProps } from "./button";

interface Props {
  buttons: ButtonProps[];
}

const ButtonGroup = (props: Props) => {
  return (
    <div className="bg-white rounded divide-y overflow-hidden shadow-md flex flex-col">
      {props.buttons.map((bProps) => (
        <Button {...bProps} />
      ))}
    </div>
  );
};

export default ButtonGroup;
