<template>
  <div>
    <Row :gutter="8">
      <Col :xs="8" :sm="8" :md="8" :lg="6">
      <Card shadow>
        <tree-table style="max-height:700px;overflow: auto"
                    expand-key="menuName"
                    @radio-click="rowClick"
                    :expand-type="false"
                    :is-fold="false"
                    :tree-type="true"
                    :selectable="false"
                    :columns="columns"
                    :data="data">
          <template slot="status" slot-scope="scope">
            <Badge v-if="scope.row.status===1" status="success"/>
            <Badge v-else="" status="error"/>
            <Icon :type="scope.row.icon" size="16"/>
          </template>
        </tree-table>
      </Card>
      </Col>
      <Col :xs="16" :sm="16" :md="16" :lg="10">
      <Card shadow>
        <div class="search-con search-con-top">
          <ButtonGroup>
            <Button type="primary"  @click="setEnabled(true)">添加
            </Button>
            <Button type="primary" :disabled="formItem.menuId ?false:true"
                    @click="confirmModal = true">删除
            </Button>
          </ButtonGroup>
          <Modal
            v-model="confirmModal"
            title="提示"
            @on-ok="handleRemove">
            确定删除,菜单资源【{{formItem.menuName}}】吗?{{formItem.children && formItem.children.length > 0 ?
            '存在子菜单,将一起删除.是否继续?' : ''}}

          </Modal>
        </div>
        <Form ref="menuForm" :model="formItem" :rules="formItemRules" :label-width="80">
          <FormItem label="上级菜单" prop="parentId">
            <treeselect
              v-model="formItem.parentId"
              :options="selectTreeData"
              :default-expand-level="1"
              :normalizer="treeSelectNormalizer"/>
          </FormItem>
          <FormItem label="菜单标识" prop="menuCode">
            <Input v-model="formItem.menuCode" placeholder="请输入内容"></Input>
          </FormItem>
          <FormItem label="菜单名称" prop="menuName">
            <Input v-model="formItem.menuName" placeholder="请输入内容"></Input>
          </FormItem>
          <FormItem label="页面地址" prop="path">
            <Input v-model="formItem.path" placeholder="请输入内容">
            <Select v-model="formItem.scheme" slot="prepend" style="width: 80px">
              <Option value="/">/</Option>
              <Option value="http://">http://</Option>
              <Option value="https://">https://</Option>
            </Select>
            <Select v-model="formItem.target" slot="append" style="width: 100px">
              <Option value="_self">窗口内打开</Option>
              <Option :disabled="formItem.scheme==='/'" value="_blank">新窗口打开</Option>
            </Select>
            </Input>
            <span v-if="formItem.scheme === '/'">前端组件：/view/module/{{formItem.path}}.vue</span>
            <span v-else="">跳转地址：{{formItem.scheme}}{{formItem.path}}</span>
          </FormItem>
          <FormItem label="图标">
            <Input v-model="formItem.icon" placeholder="请输入内容">
            <Icon size="22" :type="formItem.icon" slot="prepend"/>
            <Poptip width="600" slot="append" placement="bottom">
              <Button icon="ios-search"></Button>
              <div slot="content">
                <ul class="icons">
                  <li class="icons-item" :title="item" @click="onIconClick(item)" v-for="item in selectIcons">
                    <Icon :type="item" size="28"/>
                    <p>{{item}}</p>
                  </li>
                </ul>
              </div>
            </Poptip>
            </Input>
          </FormItem>
          <FormItem label="优先级">
            <InputNumber v-model="formItem.priority"></InputNumber>
          </FormItem>
          <FormItem label="状态">
            <RadioGroup v-model="formItem.status" type="button">
              <Radio label="0">禁用</Radio>
              <Radio label="1">启用</Radio>
            </RadioGroup>
          </FormItem>
          <FormItem label="描述">
            <Input v-model="formItem.menuDesc" type="textarea" placeholder="请输入内容"></Input>
          </FormItem>
          <FormItem>
            <Button @click="handleSubmit" :loading="saving" type="primary">保存</Button>
            <Button @click="setEnabled(true)" style="margin-left: 8px">重置</Button>
          </FormItem>
        </Form>
      </Card>
      </Col>
      <Col :xs="16" :sm="16" :md="16" :lg="8">
      <Card shadow>
        <menu-action :value="formItem"></menu-action>
      </Card>
      </Col>
    </Row>
  </div>
</template>

<script>
  import {listConvertTree, updateTreeNode} from '@/utils/index'
  // import {getMenus, updateMenu, addMenu, removeMenu} from '@/api/menu'
  import MenuAction from './menu-action.vue'
  import icons from './icons'

  export default {
    name: 'SystemMenu',
    components: {
      MenuAction
    },
    data () {
      const validateEn = (rule, value, callback) => {
        let reg = /^[_a-zA-Z0-9]+$/
        if (value === '') {
          callback(new Error('菜单标识不能为空'))
        } else if (value !== '' && !reg.test(value)) {
          callback(new Error('只允许字母、数字、下划线'))
        } else {
          callback()
        }
      }
      return {
        confirmModal: false,
        saving: false,
        visible: false,
        selectIcons: icons,
        selectTreeData: [{
          menuId: 0,
          menuName: '无'
        }],
        formItemRules: {
          parentId: [
            {required: true, message: '上级菜单', trigger: 'blur'}
          ],
          menuCode: [
            {required: true, validator: validateEn, trigger: 'blur'}
          ],
          menuName: [
            {required: true, message: '菜单名称不能为空', trigger: 'blur'}
          ]
        },
        formItem: {
          menuId: '',
          menuCode: '',
          menuName: '',
          icon: 'md-document',
          path: '',
          scheme: '/',
          target: '_self',
          status: 1,
          parentId: '0',
          priority: 0,
          menuDesc: ''
        },
        columns: [
          {
            title: '菜单名称',
            key: 'menuName',
            minWidth: '200px'
          },
          {
            title: '状态',
            key: 'status',
            type: 'template',
            minWidth: '100px',
            template: 'status'
          },
        ],
        data: []
      }
    },
    methods: {
      treeSelectNormalizer (node) {
        return {
          id: node.menuId,
          label: node.menuName,
          children: node.children
        }
      },
      setSelectTree (data) {
        this.selectTreeData = data
      },
      setEnabled (enabled) {
        if (enabled) {
          this.handleReset()
        }
      },
      rowClick (data) {
        this.handleReset()
        if (data) {
          this.formItem = Object.assign({}, data.row)
        }
        this.formItem.status = this.formItem.status + ''
      },
      handleReset () {
        const newData = {
          menuId: '',
          menuCode: '',
          menuName: '',
          icon: 'md-document',
          path: '',
          scheme: '/',
          target: '_self',
          status: '1',
          parentId: '0',
          priority: 0,
          menuDesc: ''
        }
        this.formItem = newData
        this.$refs['menuForm'].resetFields()
        this.saving = false
      },
      handleSubmit () {
        // this.$refs['menuForm'].validate((valid) => {
        //   if (valid) {
        //     this.saving = true
        //     if (this.formItem.menuId) {
        //       updateMenu(this.formItem).then(res => {
        //         if (res.code === 0) {
        //           this.$Message.success('保存成功')
        //         }
        //         this.handleSearch()
        //       }).finally(() => {
        //         this.saving = false
        //       })
        //     } else {
        //       addMenu(this.formItem).then(res => {
        //         if (res.code === 0) {
        //           this.$Message.success('保存成功')
        //         }
        //         this.handleSearch()
        //       }).finally(() => {
        //         this.saving = false
        //       })
        //     }
        //   }
        // })
      },
      handleRemove () {
        // removeMenu(this.formItem.menuId).then(res => {
        //   this.handleReset()
        //   this.handleSearch()
        //   if (res.code === 0) {
        //     this.$Message.success('删除成功')
        //   }
        // })
      },
      onIconClick (item) {
        this.formItem.icon = item
      },
      handleSearch () {
        // getMenus().then(res => {
          let opt = {
            primaryKey: 'menuId',
            parentKey: 'parentId',
            startPid: '0'
          }
        let res={
          "data":[{"createTime":"2018-07-29 21:20:10","updateTime":"2019-05-25 01:49:23","menuId":"1","menuCode":"system","menuName":"系统管理","icon":"md-folder","parentId":"0","scheme":"/","path":"","target":"_self","priority":0,"menuDesc":"系统管理","status":1,"isPersist":1,"serviceId":"open-cloud-base-server"},{"createTime":"2018-07-29 21:20:13","updateTime":"2019-03-13 21:48:12","menuId":"6","menuCode":"systemApi","menuName":"API列表","icon":"md-document","parentId":"13","scheme":"/","path":"system/api/index","target":"_self","priority":0,"menuDesc":"API接口资源","status":1,"isPersist":1,"serviceId":"open-cloud-base-server"},{"createTime":"2018-12-27 15:41:52","updateTime":"2019-07-11 18:03:45","menuId":"9","menuCode":"systemApp","menuName":"应用管理","icon":"md-apps","parentId":"1","scheme":"/","path":"system/app/index","target":"_self","priority":0,"menuDesc":"应用信息管理","status":1,"isPersist":1,"serviceId":"open-cloud-base-server"},{"createTime":"2018-12-27 15:46:29","updateTime":"2019-07-11 18:03:55","menuId":"10","menuCode":"systemUser","menuName":"用户管理","icon":"md-person","parentId":"1","scheme":"/","path":"system/user/index","target":"_self","priority":0,"menuDesc":"系统用户","status":1,"isPersist":1,"serviceId":"open-cloud-base-server"},{"createTime":"2019-01-10 20:47:19","updateTime":"2019-05-25 03:26:47","menuId":"11","menuCode":"apiDebug","menuName":"接口调试","icon":"md-document","parentId":"13","scheme":"http://","path":"localhost:8888","target":"_blank","priority":0,"menuDesc":"swagger接口调试","status":1,"isPersist":1,"serviceId":"open-cloud-base-server"},{"createTime":"2019-01-28 02:37:42","updateTime":"2019-02-25 00:16:40","menuId":"12","menuCode":"gatewayLogs","menuName":"访问日志","icon":"md-document","parentId":"13","scheme":"/","path":"gateway/logs/index","target":"_self","priority":0,"menuDesc":"","status":1,"isPersist":1,"serviceId":"open-cloud-base-server"},{"createTime":"2019-02-25 00:15:09","updateTime":"2019-03-18 04:44:20","menuId":"13","menuCode":"gateway","menuName":"API网关","icon":"md-folder","parentId":"0","scheme":"/","path":"","target":"_self","priority":0,"menuDesc":"API网关","status":1,"isPersist":1,"serviceId":"open-cloud-base-server"},{"createTime":"2019-04-01 16:30:27","updateTime":"2019-07-11 18:07:50","menuId":"15","menuCode":"task","menuName":"任务调度","icon":"md-document","parentId":"0","scheme":"/","path":"","target":"_self","priority":0,"menuDesc":"任务调度","status":1,"isPersist":1,"serviceId":"open-cloud-base-server"},{"createTime":"2019-04-01 16:31:15","updateTime":"2019-07-11 18:08:12","menuId":"16","menuCode":"job","menuName":"定时任务","icon":"md-document","parentId":"15","scheme":"/","path":"task/job/index","target":"_self","priority":0,"menuDesc":"定时任务列表","status":1,"isPersist":1,"serviceId":"open-cloud-base-server"},{"createTime":"2019-04-04 16:37:23","updateTime":"2019-04-04 16:37:23","menuId":"17","menuCode":"message","menuName":"消息管理","icon":"md-document","parentId":"0","scheme":"/","path":"","target":"_self","priority":0,"menuDesc":"消息管理","status":1,"isPersist":1,"serviceId":"open-cloud-base-server"},{"createTime":"2019-04-04 16:38:21","updateTime":"2019-07-11 18:06:23","menuId":"18","menuCode":"webhook","menuName":"异步通知日志","icon":"md-document","parentId":"17","scheme":"/","path":"msg/webhook/index","target":"_self","priority":0,"menuDesc":"异步通知日志","status":1,"isPersist":1,"serviceId":"open-cloud-base-server"},{"createTime":"2019-05-24 18:17:49","updateTime":"2019-07-11 18:08:26","menuId":"19","menuCode":"taskLogs","menuName":"调度日志","icon":"md-document","parentId":"15","scheme":"/","path":"task/logs/index","target":"_self","priority":0,"menuDesc":"调度日志","status":1,"isPersist":1,"serviceId":"open-cloud-base-server"},{"createTime":"2019-06-20 13:34:04","updateTime":"2019-06-20 13:34:04","menuId":"1141579952217567234","menuCode":"monitor","menuName":"系统监控","icon":"md-document","parentId":"0","scheme":"/","path":"","target":"_self","priority":0,"menuDesc":"系统监控","status":1,"isPersist":0,"serviceId":"open-cloud-base-server"},{"createTime":"2019-06-20 13:34:51","updateTime":"2019-07-11 18:11:58","menuId":"1141580147030405121","menuCode":"SpringBootAdmin","menuName":"SpringBootAdmin","icon":"md-document","parentId":"1141579952217567234","scheme":"http://","path":"localhost:8849","target":"_blank","priority":0,"menuDesc":"SpringBootAdmin","status":1,"isPersist":0,"serviceId":"open-cloud-base-server"},{"createTime":"2019-07-11 17:46:56","updateTime":"2019-07-11 18:04:00","menuId":"1149253733673287682","menuCode":"developer","menuName":"开发者管理","icon":"md-person","parentId":"1","scheme":"/","path":"system/developer/index","target":"_self","priority":0,"menuDesc":"开发者管理","status":1,"isPersist":0,"serviceId":"open-cloud-base-server"},{"createTime":"2019-07-19 17:01:05","updateTime":"2019-07-19 17:02:00","menuId":"1152141296369057794","menuCode":"Generate","menuName":"在线代码生成","icon":"md-document","parentId":"1","scheme":"/","path":"system/generate/index","target":"_self","priority":0,"menuDesc":"在线代码生成","status":1,"isPersist":0,"serviceId":"open-cloud-base-server"},{"createTime":"2018-07-29 21:20:13","updateTime":"2019-07-11 18:05:32","menuId":"2","menuCode":"gatewayIpLimit","menuName":"访问控制","icon":"md-document","parentId":"13","scheme":"/","path":"gateway/ip-limit/index","target":"_self","priority":1,"menuDesc":"来源IP/域名访问控制,白名单、黑名单","status":1,"isPersist":1,"serviceId":"open-cloud-base-server"},{"createTime":"2019-03-13 21:47:20","updateTime":"2019-07-11 18:05:18","menuId":"14","menuCode":"gatewayRateLimit","menuName":"流量控制","icon":"md-document","parentId":"13","scheme":"/","path":"gateway/rate-limit/index","target":"_self","priority":2,"menuDesc":"API限流","status":1,"isPersist":1,"serviceId":"open-cloud-base-server"},{"createTime":"2018-07-29 21:20:13","updateTime":"2019-07-11 18:03:23","menuId":"3","menuCode":"systemMenu","menuName":"功能菜单","icon":"md-list","parentId":"1","scheme":"/","path":"system/menus/index","target":"_self","priority":3,"menuDesc":"功能菜单资源","status":1,"isPersist":1,"serviceId":"open-cloud-base-server"},{"createTime":"2018-07-29 21:20:13","updateTime":"2019-07-11 18:04:59","menuId":"5","menuCode":"gatewayRoute","menuName":"网关路由","icon":"md-document","parentId":"13","scheme":"/","path":"gateway/route/index","target":"_self","priority":5,"menuDesc":"网关路由","status":1,"isPersist":1,"serviceId":"open-cloud-base-server"},{"createTime":"2018-12-27 15:26:54","updateTime":"2019-07-11 18:03:10","menuId":"8","menuCode":"systemRole","menuName":"角色管理","icon":"md-people","parentId":"1","scheme":"/","path":"system/role/index","target":"_self","priority":8,"menuDesc":"角色信息管理","status":1,"isPersist":1,"serviceId":"open-cloud-base-server"}]
        }

          this.data = listConvertTree(res.data, opt)
          this.setSelectTree(this.data)
        // })
      }
    },
    mounted: function () {
      this.handleSearch()
    }
  }
</script>
<style>
  .icons {
    overflow: auto;
    zoom: 1;
    height: 300px;
  }

  .icons-item {
    float: left;
    margin: 6px;
    width: 60px;
    text-align: center;
    list-style: none;
    cursor: pointer;
    color: #5c6b77;
    transition: all .2s ease;
    position: relative;
  }

  .icons-item p {
    word-break: break-all;
    overflow: hidden;
  }
</style>
