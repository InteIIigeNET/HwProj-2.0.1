import React from "react";
import { Button, Gapped } from "@skbkontur/react-ui";

interface Props {
  changeDeleteSelect(newDeleteSelect: {}): void;
  deleteFile(): void;
  deleteSelect: { target?: { value?: string } };
}

function DeleteFiles(props: Props) {
  // let deleteItems = [
  //   "Выбрать",
  //   Select.SEP,
  //   "Отчет",
  //   "Презентацию",
  //   "Отзыв консультанта",
  // ];

  return (
    <Gapped>
      <div className="deleteFiles">
        <p>Удалить:</p>
        {/*<Select*/}
        {/*  width="200px"*/}
        {/*  placeholder="Выбрать"*/}
        {/*  items={deleteItems}*/}
        {/*  onChange={props.changeDeleteSelect}*/}
        {/*/>*/}
      </div>
      {props.deleteSelect.target!.value !== "Выбрать" ? (
        <Button size="small" use="link" onClick={props.deleteFile}>
          Удалить
        </Button>
      ) : null}
    </Gapped>
  );
}

export default DeleteFiles;
