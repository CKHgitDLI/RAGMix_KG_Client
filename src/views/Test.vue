<template>
  <el-upload
      class="upload-demo"
      drag
      action="http://127.0.0.1:8090/upload/"
      :file-list="fileList"
      multiple
      >
    <i class="el-icon-upload"></i>
    <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
    <div class="el-upload__tip" slot="tip">只能上传docx或txt文件，暂不支持PDF文件</div>
  </el-upload>
</template>

<script>
export default {
  components: {},
  data() {
    return {
      fileList:"",
    };
  },
  mounted() {

  },
  methods: {},
  watch: {}
};
</script>

<style scoped>

</style>