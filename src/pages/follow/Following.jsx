import React, { useEffect, useState, useCallback } from 'react';
import TopFollowNav from '../../components/common/topNav/TopFollowNav';
import TabMenu from '../../components/common/tab/TabMenu';
import UserFollow from '../../components/common/user/UserFollow';
import { loadFollowingListAPI } from '../../api/profile/getFollowingAPI';
import { useRecoilValue } from 'recoil';
import { userTokenState } from '../../atoms/Atoms';
import * as S from './Following.style';
import { useLocation } from 'react-router-dom';

function Following() {
  // 팔로잉 데이터 및 페이지 정보 관리하는 state
  const [following, setFollowing] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const userToken = useRecoilValue(userTokenState);
  const pageSize = 8;
  const [pageNumber, setPageNumber] = useState(0);

  // 계정 이름 가져오기
  const location = useLocation();
  const accountname = location.pathname.split('/')[2];
  const skip = pageNumber * pageSize;

  // 팔로잉 목록 api 호출 함수
  const loadFollowing = useCallback(async () => {
    if (!hasMore) return;

    const data = await loadFollowingListAPI(
      accountname,
      userToken,
      skip,
      pageSize,
    );

    if (data) {
      // 팔로잉 데이터 업데이트
      setFollowing((prevState) => [...prevState, ...data]);
      if (data.length < pageSize) {
        setHasMore(false);
      }
    } else {
      console.error('API returned null or undefined');
    }
  }, [accountname, userToken, skip, pageSize, hasMore]);

  // 팔로잉 데이터 가져오기
  useEffect(() => {
    loadFollowing(pageNumber);
  }, [loadFollowing, pageNumber]);

  // 무한 스크롤 구현
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >=
          document.documentElement.offsetHeight ||
        !hasMore
      ) {
        return;
      }
      setPageNumber((prevPageNumber) => prevPageNumber + 1);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasMore]);

  // 불필요한 리렌더링 방지용 메모이제이션 컴포넌트
  const MemoizedUserFollow = React.memo(UserFollow);

  return (
    <div>
      <TopFollowNav title="Following" />
      <S.FollowingWrapper>
        <S.FollowingUserList>
          {following &&
            following.map((item, index) => (
              <MemoizedUserFollow
                key={`${item.accountname}-${index}`}
                data={item}
              />
            ))}
        </S.FollowingUserList>
      </S.FollowingWrapper>
      <TabMenu />
    </div>
  );
}

export default Following;
