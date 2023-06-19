import React, { useState, useEffect } from 'react';
import TopUploadNav from '../../components/common/topNav/TopUploadNav';
import * as S from './ProfileEdit.style';
import ProfileImage from '../../assets/images/full-logo.svg';
import EditProfileImage from '../../assets/images/img-button.svg';
import InputBox from '../../components/common/input/InputBox';

export default function ProfileEdit() {
  //인풋 입력 상태 저장
  const [username, setUsername] = useState(''); //사용자 이름 값
  const [accountId, setAccountId] = useState(''); // 계정 ID 값
  const [introduction, setIntroduction] = useState(''); // 소개 값

  const [isInputFilled, setIsInputFilled] = useState(false);

  // 유효성 검사 결과 저장
  const [isUsernameValid, setIsUsernameValid] = useState(false);
  const [isAccountIdValid, setIsAccountIdValid] = useState(true);

  // 유효성 검사 통과 실패 시 에러 메시지
  const [usernameErrorMessage, setUsernameErrorMessage] = useState('');
  const [accountIdErrorMessage, setAccountIdErrorMessage] = useState('');

  // 사용자 이름 유효성 검사 및 에러 메시지 설정
  const handleUserNameValid = (e) => {
    const currentUsername = e.target.value;
    setUsername(currentUsername);
    if (currentUsername === '') {
      setIsUsernameValid(false);
      setUsernameErrorMessage('');
    } else if (currentUsername.length >= 2 && currentUsername.length <= 10) {
      setIsUsernameValid(true);
      setUsernameErrorMessage('');
    } else {
      setIsUsernameValid(false);
      setUsernameErrorMessage('* 2~10자로 작성해주세요');
    }
  };

  // 계정 ID 유효성 검사 및 에러 메시지 설정
  const handleAccountIdValid = (e) => {
    const inputAccountId = e.target.value;
    setAccountId(inputAccountId);

    if (inputAccountId) {
      const regex = /^[a-zA-Z0-9._]+$/;
      const isValid = regex.test(inputAccountId);
      if (!isValid) {
        setIsAccountIdValid(false);
        setAccountIdErrorMessage(
          '영문, 숫자, 특수문자(.),(_)만 사용 가능합니다.',
        );
      } else {
        setIsAccountIdValid(true);
        setAccountIdErrorMessage('');
      }
    } else {
      setIsAccountIdValid(true);
      setAccountIdErrorMessage('');
    }
  };

  // 사용자 이름, 계정 ID input 값이 유효한지 확인
  useEffect(() => {
    if (isUsernameValid && isAccountIdValid && username && accountId) {
      setIsInputFilled(true);
    } else {
      setIsInputFilled(false);
    }
  }, [isUsernameValid, isAccountIdValid, username, accountId]);

  return (
    <div>
      <TopUploadNav>
        {/* input 값이 모두 채워지면 저장 버튼 활성화 */}
        {isInputFilled ? (
          <S.CustomSaveButton>저장</S.CustomSaveButton>
        ) : (
          <S.CustomDisabledSaveButton>저장</S.CustomDisabledSaveButton>
        )}
      </TopUploadNav>
      <S.ProfileEdit>
        <S.ImageContainer>
          <S.ProfileImage src={ProfileImage} />
          <S.EditProfileImage src={EditProfileImage} />
        </S.ImageContainer>
        <InputBox
          label="사용자 이름"
          id="username"
          type="text"
          placeholder="2~10자 이내여야 합니다."
          value={username}
          min={2}
          max={10}
          borderBottomColor={isUsernameValid ? null : 'on'}
          errorMessage={usernameErrorMessage}
          show={!isUsernameValid ? 'on' : null}
          onChange={handleUserNameValid}
        />
        <InputBox
          label="계정 ID"
          id="accountId"
          type="text"
          placeholder="영문, 숫자, 특수문자(.),(_)만 사용 가능합니다."
          value={accountId}
          borderBottomColor={isAccountIdValid ? null : 'on'}
          errorMessage={accountIdErrorMessage}
          show={!isAccountIdValid ? 'on' : null}
          onChange={handleAccountIdValid}
        />
        <InputBox
          label="소개"
          id="introduction"
          type="text"
          placeholder="자신과 판매할 상품에 대해 소개해 주세요!"
          value={introduction}
          borderBottomColor={null}
          errorMessage={null}
          show={null}
          onChange={(e) => setIntroduction(e.target.value)}
        />
      </S.ProfileEdit>
    </div>
  );
}
