import React from "react";
import { Button, Gapped, Link } from "@skbkontur/react-ui";
import LinkIcon from "@skbkontur/react-icons/Link";

interface Props {
  handleNewLink(
    event: React.ChangeEvent<HTMLInputElement>,
    value: string
  ): void;
  attachLink(): void;
  deleteLink(): void;
}

function InputLink(props: Props) {
  return (
    <div className="inputLink">
      <Gapped>
        {/*<Input*/}
        {/*  width={"30vw"}*/}
        {/*  name="attachLink"*/}
        {/*  onChange={props.handleNewLink}*/}
        {/*  prefix="http://"*/}
        {/*/>*/}
        <Button icon={<LinkIcon />} size="small" onClick={props.attachLink}>
          Прикрепить
        </Button>
        <Link use="grayed" onClick={props.deleteLink}>
          Удалить ссылку
        </Link>
      </Gapped>
    </div>
  );
}

export default InputLink;
