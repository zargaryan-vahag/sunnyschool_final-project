import React, { useState, useEffect } from 'react';
import CloseIcon from '@material-ui/icons/Close';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';

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
        loadedFiles.push({
          thumb: reader.result,
          name: files[index].name,
          extension: files[index].name.split('.').pop().toLowerCase()
        });
        readFiles(files, ++index, filesCount, loadedFiles);
      };

      reader.readAsDataURL(files[index]);
    } else {
      setFiles({
        loading: false,
        fileList: loadedFiles,
      });
    }
  }

  const imgExtensions = ['png', 'jpg', 'jpeg', 'gif'];
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
    return (<>
      {files.fileList.map((file, index) => (<span key={index}>
        {imgExtensions.indexOf(file.extension) == -1 ?
          (<Box
            justifyContent="center"
            display="flex"
            alignItems="center"
            key={index}
          >
            <a download href={file.thumb}>{file.name}</a>
            <Button
              onClick={() => {
                files.fileList.splice(index, 1);
                props.onDelete(index);
              }}
              style={{
                padding: 0,
                minWidth: 'inherit',
                marginLeft: '5px',
              }}
            >
              <CloseIcon />
            </Button>
          </Box>) :
          (<Box
            display="inline-block"
            position="relative"
            key={index}
          >
            <img
              src={file.thumb}
              alt={props.files[index].name}
              width={200}
              style={{
                margin: '5px',
              }}
            />
            <Button
              onClick={() => {
                files.fileList.splice(index, 1);
                props.onDelete(index);
              }}
              style={{
                padding: 0,
                minWidth: 'inherit',
                marginLeft: '5px',
                position: 'absolute',
                top: '5px',
                right: '5px',
                backgroundColor: 'grey',
              }}
            >
              <CloseIcon />
            </Button>
          </Box>)
        }
      </span>))}
    </>);
  } else {
    if (!files.loading || props.files?.length != files.fileList.length) {
      return <></>;
    } else {
      return <p>loading...</p>;
    }
  }
}
