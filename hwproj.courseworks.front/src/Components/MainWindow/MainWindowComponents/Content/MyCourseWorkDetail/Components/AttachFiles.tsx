import React from "react";

interface Props {
  attachFile(fileList: FileList): void;
  changeAttachSelect(newAttachSelect: {}): void;
  attachSelect: { target?: { value?: string } };
}

function AttachFiles(props: Props) {
  // let attachItems = [
  //   "Выбрать",
  //   Select.SEP,
  //   "Отчет",
  //   "Презентацию",
  //   "Отзыв консультанта",
  // ];

  return (
    <div className="attachFiles">
      <p>Прикрепить:</p>
      {/*<Select*/}
      {/*  width="200px"*/}
      {/*  placeholder="Выбрать"*/}
      {/*  items={attachItems}*/}
      {/*  onChange={props.changeAttachSelect}*/}
      {/*/>*/}
      {props.attachSelect.target!.value !== "Выбрать" ? (
        <input
          className="inputAttach"
          name={props.attachSelect.target!.value}
          type="file"
          onChange={(e) => props.attachFile(e.target.files!)}
        />
      ) : null}
    </div>
  );
}

export default AttachFiles;
