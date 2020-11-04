interface Props {
  children: JSX.Element[];
}

const ButtonGroup = (props: Props) => {
  return (
    <div className="bg-white rounded divide-y overflow-hidden shadow-md">
      {props.children}
    </div>
  );
};

export default ButtonGroup;
