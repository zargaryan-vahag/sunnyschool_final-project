import React, { useState, useEffect } from 'react';

export default function Thumb(props) {
  function loadFiles(files) {
    if (files && files.length === 0) {
      return;
    }

    setFiles({
      loading: true,
      fileList: [],
    });

    readFiles(files, 0, files.length, []);
  }

  function readFiles(files, index, filesCount, loadedFiles) {
    if (files[index]) {
      let reader = new FileReader();

      reader.onloadend = () => {
        index++;
        loadedFiles.push({
          thumb: reader.result,
        });
        readFiles(files, index, filesCount, loadedFiles);
      };

      reader.readAsDataURL(files[index]);
    } else {
      setFiles({
        loading: false,
        fileList: loadedFiles,
      });
    }
  }

  const [files, setFiles] = useState({
    loading: false,
    fileList: [],
  });

  useEffect(() => {
    loadFiles(props.files);
  }, [props.files]);

  if (!props.files) {
    return null;
  }

  if (props.files && props.files.length > 0 && props.files.length == files.fileList.length) {
    return (
      <>
        {files.fileList.map((file, index) => (
          <img
            key={index}
            src={file.thumb}
            alt={props.files[index].name}
            width={200}
            style={{
              margin: '5px',
            }}
          />
        ))}
      </>
    );
  } else {
    if (!files.loading || props.files?.length != files.fileList.length) {
      return <></>;
    } else {
      return <p>loading...</p>;
    }
  }
}
