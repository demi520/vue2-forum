<template>
  <transition 
    enter-active-class="animated slideInUp"
    leave-active-class="animated slideOutDown"
  >
    <div class="pfi z50 wh100 release">
      <dialogAlert />
      <mu-appbar title="发布">
        <mu-icon-button icon="arrow_back" slot="left" @click.native="quitPage" />
      </mu-appbar>
      <mu-flexbox orient="vertical" align="center">
        <mu-select-field 
          v-model="moduleVal" 
          labelFocusClass="label-focus"
          underlineFocusClass="underline-focus"
          label="选择模块"
        >
          <mu-menu-item value="ask" title="问答"/>
          <mu-menu-item value="share" title="分享"/>
          <mu-menu-item value="job" title="招聘"/>
        </mu-select-field>
        <mu-text-field 
          label="标题" 
          v-model="title" 
          labelFocusClass="label-focus"
          underlineFocusClass="underline-focus"
          hintText="10个字符以上"
        />
        <div class="edit-btn" @click="isopen=true">
          {{ topic.btntext }}
        </div>
        <mu-flat-button label="发布" class="fetch-btn" @click="releaseTopic" />
      </mu-flexbox>
      <mu-bottom-sheet sheetClass="wh100 grail release-edit-page" :open="isopen">
        <mu-tabs
          lineClass="tabs-line"
          :value="activeTab" 
          @change="handleTabChange"
        >
          <mu-tab value="tab1" title="编辑"/>
          <mu-tab value="tab2" title="预览"/>
        </mu-tabs>
        <div class="fe ova content" v-show="activeTab === 'tab1'">
          <mu-text-field 
            label="正文" 
            class="edit-main" 
            hintText="建议使用 Markdown 语法"
            labelFocusClass="label-focus"
            underlineFocusClass="underline-focus"
            :value="content" 
            @input="update"
            multiLine
            :rows="15" 
          />
        </div>
        <div class="fe context ova" v-show="activeTab === 'tab2'">
          <div v-html="compiledMarkdown"></div>
        </div>
        <mu-flexbox justify="flex-end">
          <mu-flat-button label="保存" class="save-btn" @click="saveEdit"/>
          <mu-flat-button label="取消" class="cancel-btn" @click="cancelEdit" />
        </mu-flexbox>
      </mu-bottom-sheet>
    </div>
  </transition>
</template>

<script>
import { mapState, mapMutations } from 'vuex'
import Marked from 'marked'
// import highlightjs from 'highlight.js'     //很大，500kb
// import 'highlight.js/styles/googlecode.css'
import dialogAlert from '../../components/dialogAlert'
import debounce from 'lodash/debounce'
import { getCookie } from '../../assets/js/cookies.js'

export default {
  data(){
    return{
      moduleVal: "ask",
      title: "",
      content: this.releaseData(),
      isopen: false,
      activeTab: "tab1"
    }
  },
  computed: {
    ...mapState([
      'detail',
      'topic'
		]),
    compiledMarkdown: function () {
      return Marked(this.content, { sanitize: true });
    }
  },
  methods: {
    ...mapMutations([
      'SHOW_DIALOGALERT',
      'HIDE_RELEASEPAGE',
      'CHANGE_BTN_TEXT'
    ]),
    releaseData(){
      return localStorage.getItem('release_data') || '';
    },
    handleTabChange(val){
      this.activeTab = val;
    },
    update: debounce(function (e) {
      this.content = e;
    }, 300),
    saveEdit(){
      localStorage.setItem('release_data', this.content);
      this.CHANGE_BTN_TEXT({text: "文本已保存，可直接发布"});
      this.isopen = false;
    },
    cancelEdit(){
      this.isopen = false;
    },
    releaseTopic(){
      if(this.detail.isfetching) return;
      if(this.title.trim().length < 10){
        this.SHOW_DIALOGALERT({msg: "话题标题字数不能小于10个"});
        return;
      }
      if(this.content.trim()==''){
        this.SHOW_DIALOGALERT({msg: "请输入话题内容"});
        return;
      }
      this.$store.dispatch("fetchReleaseTopic",{
        title: this.title,
        tab: this.moduleVal,
        content: this.content,
        accesstoken: getCookie('accesstoken')
      });
    },
    quitPage(){
      this.HIDE_RELEASEPAGE();
    }
  },
  components: {
    dialogAlert,
    // highlightjs
  }
}
</script>

<style lang="less">
  .release{
    background-color: #fff;
    .mu-text-field{
      width: 88%;
      margin-top: 1rem;
      margin-bottom: 0;
    }
    .edit-btn{
      width: 88%;
      line-height: 2.82rem;
      padding-left: .5rem;
      margin: .5rem 0 1.5rem;
      text-align: left;
      color: #475669;
      background-color: #eff2f7;
    }
  }
  .release-edit-page{
    .mu-tabs{
      background-color: #1ba167;
    }
    .tabs-line{
      background-color: #fff;
    }
    .content{
      .edit-main{
        width: 88%;
        margin-top: 1rem;
        margin-left: 6%;
      }
    }
    .context{
      padding: 1rem;
    }
    .save-btn{
      color: #41b883;
    }
    .cancel-btn{
      margin: 1rem 1rem 1rem .2rem;
      color: #8492a6;
    }
  }
</style>
