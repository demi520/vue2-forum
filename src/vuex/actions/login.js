import * as types from '../constants/types'
import { setCookie } from '../../assets/js/cookies'
import axios from 'axios'


// a.登录不成功提示报错，b.登录成功提示成功，设置缓存，并获取用户数据切换页面。
const loginActions = {

  /**
   * @type {post}
   * @param {accesstoken} [String] accesstoken
   */
  fetchUserLogin({ commit, state, dispatch }, params){
    // 用于状态加载动画
    commit(types.FETCH_LOGIN_REQ);
    axios({
      method: 'post',
      url: 'accesstoken',
      params: {
        accesstoken : params.accesstoken
      }
    }).then((res) => {
      //登录成功提示
      dispatch('showInfoPopup', {
        msg: '登录成功',
        bottom: 56,    //虽然加了默认值，但是不写的话，多次弹出后没有bottom效果
        state: true
      })

      // 将 accesstoken 缓存在 cookie 中
      setCookie('accesstoken', params.accesstoken);

      // 将 accesstoken 存于store中
      commit(types.SET_ACCESSTOKEN, {
        accesstoken: params.accesstoken
      });

      // 获取基本个人数据
      commit(types.FETCH_LOGIN_SUC, {
        data: res.data
      });

      // 获取个人数据（包含话题数据）
      dispatch('fetchUserInfo', {
        loginname: res.data.loginname
      })

      // 获取消息
      dispatch('fetchMessage', {
        accesstoken: params.accesstoken
      })
  
    }).catch((err) => {
      console.log(err);
      dispatch('showInfoPopup', {
        msg: '登录失败，请检查网络或accesstoken是否正确'
      })
      commit(types.FETCH_LOGIN_ERR);
    })
  },

  /**
   * @type {post}
   * @param {loginname} [String] 用户名
   */
  fetchUserInfo({ commit, state }, params){
    axios({
      method: 'get',
      url: 'user/' + params.loginname
    }).then((res) => {
      commit(types.FETCH_USERINFO, {
          data: res.data.data
      })
    })
  }
}

export default loginActions;