<template>
  <div class="kgWidget">
    <div class="flexRow container" v-if="show_query">
      <!-- 左侧查询面板 -->
      <div class="queryPanel">
        <div class="inputGroup">
          <label for="cqi" class="inputLabel">
            <span class="labelIcon">📝</span>
            CQL Query
            <span class="hint">(支持多行输入)</span>
          </label>
          <textarea
              id="cqi"
              v-model="query"
              class="styledTextarea"
              placeholder="输入您的CQL查询语句..."
              @keydown.ctrl.enter="executeQuery"
          ></textarea>

          <label for="database" class="inputLabel">
            <span class="labelIcon">🗃️</span>
            目标数据库
          </label>
          <div class="inputWrapper">
            <input
                id="database"
                v-model="database"
                type="text"
                class="styledInput"
                placeholder="输入数据库名称"
                @keyup.enter="executeQuery"
            >
            <button
                class="executeBtn"
                :class="{ loading: isLoading }"
                @click="executeQuery"
            >
              <span v-if="!isLoading">🚀 执行查询</span>
              <span v-else class="loadingText">⏳ 查询中...</span>
            </button>
          </div>
        </div>
      </div>

      <!-- 右侧可视化区域 -->
      <div class="visualizationPanel">
        <div class="visualizationHeader">
          <h2>关系图谱可视化</h2>
          <div class="legend">
            <span class="nodeLegend">● 节点</span>
            <span class="edgeLegend">─ 关系</span>
          </div>
        </div>
        <div class="editBox flexColumn">
          <Visualization @clickNode="handleClickNode" :records="records" :clearAll="clearAll"></Visualization>
        </div>
      </div>
    </div>

    <transition name="fade">
      <div v-if="errorMessage" class="errorAlert">
        ⚠️ {{ errorMessage }}
      </div>
    </transition>

    <Visualization @clickNode="handleClickNode" :records="records" :clearAll="clearAll"></Visualization>
  </div>
</template>

<script>
import {Visualization} from "components/D3Visualization";
import {setting} from "config/index";

var neo4j = require("neo4j-driver");
export default {
  components: {
    Visualization
  },
  data() {
    return {
      show_query: false,
      query:
          "MATCH (n)-[r]->(m)\n" +
          "RETURN n, r, m\n" +
          "LIMIT 200",
      records: [],
      clearAll: false,
      database: "ckh",
      errorMessage: "",
      isLoading: false,
    };
  },
  mounted() {
    this.$alert('本系统用于演示增强KG构建方法的自建知识图谱结构与自建可视化能力。', '知识图谱驱动的大模型检索增强系统研究', {
      confirmButtonText: '我知道了',
    });
    this.openFullscreen()
    if (this.isMobileDevice()) {
      this.show_query = false
      this.renderResize()
      this.query =
          "MATCH (n)-[r]->(m)\n" +
          "RETURN n, r, m\n" +
          "LIMIT 100"
    } else {
      this.show_query = true
    }
    console.info(this.$route.query.param)
    if (this.$route.query.param) {
      let t = JSON.parse(this.$route.query.param)
      this.query = t.query;
      this.database = t.database;
    }
    this.driver = neo4j.driver(
        setting.neo4jUrl,
        neo4j.auth.basic(setting.neo4jUserName, setting.neo4jPassword)
    );
    this.executeQuery();
  },
  methods: {
    openFullscreen() {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen();
      } else if (document.documentElement.mozRequestFullScreen) { /* Firefox */
        document.documentElement.mozRequestFullScreen();
      } else if (document.documentElement.webkitRequestFullscreen) { /* Chrome, Safari & Opera */
        document.documentElement.webkitRequestFullscreen();
      } else if (document.documentElement.msRequestFullscreen) { /* IE/Edge */
        document.documentElement.msRequestFullscreen();
      }
    },
    renderResize() {
      // 判断横竖屏
      let width = document.documentElement.clientWidth
      let height = document.documentElement.clientHeight
      if (width < height) {
        alert('检测到移动端浏览，请横屏浏览')
      }
    },
    //判断当前设备是否为移动端
    isMobileDevice() {
      const ua = navigator.userAgent.toLowerCase();
      const t1 =
          /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini|mac/i.test(
              ua
          );
      const t2 =
          ua.indexOf("windows") < 0 &&
          ua.indexOf("iphone") < 0 &&
          navigator.maxTouchPoints > 1;
      return t1 || t2;
    },
    handleClickNode(item) {
      console.info(item)
    },
    executeQuery() {
      this.isLoading = true;
      let me = this;
      me.records = [];
      this.clearAll = true;
      var session = this.driver.session({database: this.database});
      let query = this.query;
      if (query == "") return;
      session
          .run(query, {})
          .then(function (result) {
            me.clearAll = false;
            me.records = result.records;
            console.info("neo4j 结果", result);
            session.close();
          })
          .catch(function (error) {
            console.info(error)
            console.info("查询语句不合法");
            me.$message.error("查询语句不合法")
            // me.errorMessage="查询语句不合法"
            me.driver.close();
          });
      this.isLoading = false;
    }
  },
  watch: {
    records: {
      handler: function (val, oldVal) {
      },
      deep: true
    }
  }
};
</script>

<style scoped>
/* 基础布局 */
.kgWidget {
  --primary-color: #2c3e50;
  --accent-color: #42b983;
  --error-color: #ff4757;
  --bg-color: #f8f9fa;
  --border-color: #e0e0e0;
  height: 100vh;
  background: var(--bg-color);
  position: relative;
}

.container {
  display: flex;
  height: calc(100% - 20px);
  margin: 10px;
  gap: 15px;
}

/* 左侧查询面板 */
.queryPanel {
  flex: 1;
  max-width: 22vw;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  padding: 20px;
  display: flex;
  flex-direction: column;
}

.inputGroup {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.inputLabel {
  font-weight: 600;
  color: var(--primary-color);
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.labelIcon {
  font-size: 1.2em;
}

.hint {
  font-size: 0.85em;
  color: #666;
  font-weight: normal;
}

/* 输入框样式 */
.styledTextarea,
.styledInput {
  width: 20vw;
  padding: 12px;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  font-family: 'Courier New', Courier, monospace;
  transition: all 0.3s ease;
  font-size: large;
  font-weight: bold;
}

.styledTextarea {
  min-height: 50vh;
  resize: vertical;
  line-height: 1.5;
  font-size: large;
  font-weight: bold;
}

.styledTextarea:focus,
.styledInput:focus {
  border-color: var(--accent-color);
  box-shadow: 0 0 0 3px rgba(66, 185, 131, 0.2);
  outline: none;
}

/* 执行按钮 */
.inputWrapper {
  position: relative;
}

.executeBtn {
  width: 100px;
  padding: 12px;
  margin-top: 10px;
  background: linear-gradient(135deg, var(--accent-color), #34a774);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  justify-content: center;
  align-items: center;
}

.executeBtn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(66, 185, 131, 0.3);
}

.executeBtn.loading {
  background: linear-gradient(135deg, #95a5a6, #7f8c8d);
  cursor: not-allowed;
}

.loadingText {
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
}

/* 右侧可视化面板 */
.visualizationPanel {
  flex: 2;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  padding: 20px;
  display: flex;
  flex-direction: column;
}

.visualizationHeader {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.visualizationHeader h3 {
  margin: 0;
  color: var(--primary-color);
}

.legend span {
  padding: 6px 12px;
  border-radius: 20px;
  margin-left: 10px;
}

.nodeLegend {
  background: rgba(66, 185, 131, 0.1);
  color: var(--accent-color);
}

.edgeLegend {
  background: rgba(66, 185, 131, 0.1);
  color: var(--accent-color);
}

.visualizationContent {
  flex: 1;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  overflow: hidden;
}

/* 错误提示 */
.errorAlert {
  position: fixed;
  bottom: 20px;
  right: 20px;
  padding: 15px 25px;
  background: var(--error-color);
  color: white;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.15);
  animation: slideIn 0.3s ease;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter, .fade-leave-to {
  opacity: 0;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
  }
  to {
    transform: translateX(0);
  }
}
</style>