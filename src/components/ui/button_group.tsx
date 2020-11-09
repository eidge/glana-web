import Button, { ButtonProps } from "./button";

type directionOptions = "horizontal" | "vertical";

interface Props {
  buttons: ButtonProps[];
  direction?: directionOptions;
}

function addDefaultProps(props: Props): Required<Props> {
  return {
    ...props,
    direction: props.direction || "horizontal",
  };
}

const directionClasses: { [key in directionOptions]: string } = {
  horizontal: "divide-x flex-row",
  vertical: "divide-y flex-col",
};

const ButtonGroup = (p: Props) => {
  let props = addDefaultProps(p);
  let classes = ["btn-group"];

  classes.push(directionClasses[props.direction]);

  return (
    <div className={classes.join(" ")}>
      {props.buttons.map((bProps, index) => (
        <Button {...bProps} inButtonGroup={true} key={index} />
      ))}
    </div>
  );
};

export default ButtonGroup;
