import { useState, useRef, useEffect } from 'react';
import React from 'react';
import BasicProfileImg from '../../assets/images/Ellipse-1.png';
import TopUploadNav from '../../components/common/topNav/TopUploadNav.jsx';
import * as S from './UploadPost.style';
import imageCompression from 'browser-image-compression';
import { uploadImagesAPI } from '../../api/uploadImg/uploadImagesAPI';
import { uploadPostAPI } from '../../api/post/uploadPostAPI';
import { getMyInfoAPI } from '../../api/user/getMyInfoAPI';
import { apiURL } from '../../api/apiURL';
import { useRecoilValue } from 'recoil';
import { userTokenState } from '../../atoms/Atoms';
import { useNavigate } from 'react-router-dom';

export default function UploadPost() {
  const [selectedImages, setSelectedImages] = useState([]);
  const [textLength, setTextLength] = useState(0);
  const [text, setText] = useState('');
  const [disabled, setDisabled] = useState(true);
  const [myProfileImg, setMyProfileImg] = useState('');
  const navigate = useNavigate();
  const token = useRecoilValue(userTokenState);
  const [postData, setPostData] = useState('');
  const [clickedTags, setClickedTags] = useState([]);

  const Tags = [
    '육아',
    '일상',
    '요리',
    '꿀팁',
    '음식점',
    '꿀템추천',
    '키즈카페',
  ];

  useEffect(() => {
    getMyInfoAPI(token).then((data) => {
      setMyProfileImg(data.user.image); //프로필 사진 가져오기
    });
  }, []);

  const textRef = useRef(null);
  const handleTextArea = (e) => {
    setTextLength(e.target.value.length);
    setText(e.target.value);
    if (e.target.value.length > 0) {
      setDisabled(false);
    } else {
      setDisabled(true);
    }
  };

  //내가 보낼 데이터
  const sendData = {
    post: {
      content:
        clickedTags.length > 0
          ? `content:${text}\\tag:${clickedTags}`
          : `content:${text}`,
      image: selectedImages.join(','), //"imageurl1, imageurl2" 형식으로 보내야한다.
    },
  };

  const handleImageSelect = async (event) => {
    const file = event.target.files[0];

    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 440,
      initialQuality: 0.7,
    };
    const compressedBlob = await imageCompression(file, options); //blob이기 떄문에 file로 바꿔줘야함.
    const compressedFile = new File([compressedBlob], file.name, {
      type: file.type,
    });

    const formData = new FormData();

    formData.append('image', compressedFile);
    if (selectedImages.length >= 3) {
      alert('이미지는 최대 3장까지 선택할 수 있습니다.');
    } else {
      uploadImagesAPI(formData).then((data) => {
        setSelectedImages([...selectedImages, `${apiURL}${data[0].filename}`]);
      });
    }
  };

  //textarea 높이 조절
  const handleResizeHeight = () => {
    textRef.current.style.height = 'auto';
    textRef.current.style.height = `${textRef.current.scrollHeight}px`;
  };

  const handleDeleteImage = (index) => {
    setSelectedImages((prevSelectedImages) => {
      const updatedImages = [...prevSelectedImages];
      updatedImages.splice(index, 1);
      return updatedImages;
    });
  };

  // 업로드 버튼 //오류나면 e.preventDefalt어쩌구
  const handleUpload = async () => {
    try {
      const data = await uploadPostAPI(sendData, token);
      setPostData(data.post.id);
    } catch (error) {
      console.error(error);
    }
  };

  //태그

  const handleClickTag = (tag) => {
    // 클릭된 태그가 이미 클릭된 상태인지 확인
    const tagExists = clickedTags.includes(tag);

    if (tagExists) {
      // 기존 클릭된 태그 제거
      setClickedTags(clickedTags.filter((t) => t !== tag));
    } else {
      // 새로 클릭된 태그 추가
      setClickedTags([...clickedTags, tag]);
    }
  };

  // 이 useEffect 안에서만 변경사항을 확인할 수 있습니다.
  useEffect(() => {
    if (postData) {
      navigate(`/post/${postData}`);
    }
  }, [postData]);

  return (
    <S.Container>
      <TopUploadNav disabled={disabled} handleUpload={handleUpload} />
      <S.TagWrapper>
        {Tags.map((tag, index) => (
          <S.TagList
            type="button"
            key={index}
            value={tag}
            onClick={() => handleClickTag(tag)}
            clicked={clickedTags.includes(tag)}
          >
            {tag}
          </S.TagList>
        ))}
      </S.TagWrapper>
      <S.Main>
        <S.ImgProfile src={myProfileImg ? myProfileImg : BasicProfileImg} />
        <S.Article>
          <form id="게시물">
            <S.TextArea
              onInput={handleResizeHeight}
              maxLength="300"
              ref={textRef}
              onChange={handleTextArea}
              rows={1}
              placeholder="게시글 입력하기.."
            ></S.TextArea>
            <S.TextLengthWrap>
              <p>{textLength}/300자</p>
            </S.TextLengthWrap>
            <S.Label htmlFor="InputImg">
              <S.InputImg
                type="file"
                id="InputImg"
                name="Input-img"
                accept="image/*"
                onChange={handleImageSelect}
                multiple
              />
            </S.Label>
          </form>
          <section>
            {selectedImages &&
              (selectedImages.length === 1 ? (
                <S.SingleImgCont>
                  <S.SingleImg src={selectedImages[0]} alt="" />
                  <S.RemoveButton
                    type="button"
                    onClick={() => handleDeleteImage(0)}
                  ></S.RemoveButton>
                </S.SingleImgCont>
              ) : (
                <S.MultipleImgScrollCont>
                  {selectedImages.map((image, index) => (
                    <S.MultipleImgCont key={index}>
                      <S.MultipleImg src={image} alt="" />
                      <S.RemoveButton
                        type="button"
                        onClick={() => handleDeleteImage(index)}
                      ></S.RemoveButton>
                    </S.MultipleImgCont>
                  ))}
                </S.MultipleImgScrollCont>
              ))}
          </section>
        </S.Article>
      </S.Main>
    </S.Container>
  );
}

//textarea height 는 한줄쓰면 18px,두줄쓰면 36px, 세줄쓰면 48px
//html form바깥에서 submit하는 방법 https://negabaro.github.io/archive/how-to-post-button-out-to-form

// const file = event.target.files[0];

// const fileReader = new FileReader();
// fileReader.readAsDataURL(file);
// fileReader.onload = (event) => {
//   const result = event.target.result;
//   setPreviewImages([...previewImages, result]);
// };
