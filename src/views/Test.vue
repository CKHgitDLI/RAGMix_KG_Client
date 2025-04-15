<template>
<!--  <el-upload-->
<!--      class="upload-demo"-->
<!--      drag-->
<!--      action="http://127.0.0.1:8090/upload/"-->
<!--      :file-list="fileList"-->
<!--      multiple-->
<!--  >-->
<!--    <i class="el-icon-upload"></i>-->
<!--    <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>-->
<!--    <div class="el-upload__tip" slot="tip">只能上传docx或txt文件，暂不支持PDF文件</div>-->
<!--  </el-upload>-->
  <el-button type="primary" plain @click="chat">主要按钮</el-button>
</template>

<script>
// import OpenAI from "openai";

export default {
  components: {},
  data() {
    return {
      fileList: "",
      reasoningContent: '',
      answerContent: '',
      isAnswering: false,
      openai: null,
    };
  },
  mounted() {
    this.openai=new OpenAi({
        apiKey: "sk-b5883e47d69a417daae9f529e8e3ebf8", // 从环境变量读取
        baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1'
      });
  },
  methods: {
    async chat() {
      try {
        const stream = await this.openai.chat.completions.create({
          model: 'qwq-32b',
          messages: [{role: 'user', content: '9.9和9.11谁大'}],
          // QwQ 模型仅支持流式输出方式调用
          stream: true
        });
        console.log('\n' + '='.repeat(20) + '思考过程' + '='.repeat(20) + '\n');
        for await (const chunk of stream) {
          // if (!chunk.choices?.length) {
          //   console.log('\nUsage:');
          //   console.log(chunk.usage);
          //   continue;
          // }
          const delta = chunk.choices[0].delta;
          // 处理思考过程
          if (delta.reasoning_content) {
            process.stdout.write(delta.reasoning_content);
            this.reasoningContent += delta.reasoning_content;
            console.info(this.reasoningContent)
          }
          // 处理正式回复
          else if (delta.content) {
            if (!isAnswering) {
              console.log('\n' + '='.repeat(20) + '完整回复' + '='.repeat(20) + '\n');
              this.isAnswering = true;
            }
            process.stdout.write(delta.content);
            this.answerContent += delta.content;
            console.info(this.answerContent)
          }
        }
      } catch (error) {
        console.error('Error:', error);
      }
    },
  },
  watch: {}
};
</script>

<style scoped>

</style>