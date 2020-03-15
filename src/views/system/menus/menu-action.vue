<template>
  <div>
    <div class="search-con search-con-top">
      <ButtonGroup>
        <Button
          :disabled="value.menuId && value.menuId!=='0' && !value.hasChild ?false:true"
          class="search-btn" type="primary" @click="handleModal()">
          <span>添加功能按钮</span>
        </Button>
      </ButtonGroup>
    </div>
    <Alert type="info" show-icon>请绑定相关接口资源。否则请求网关服务器将提示<code>"权限不足,拒绝访问!"</code></Alert>
    <Table border :columns="columns" :data="data" :loading="loading">
      <template slot="status" slot-scope="{ row }">
        <Badge v-if="row.status===1" status="success"/>
        <Badge v-else="" status="error"/>
        <span>{{row.actionName}}</span>
      </template>
      <template slot="action" slot-scope="{ row }">
        <a  @click="handleModal(row)">编辑</a> &nbsp;
        <a  @click="handleModal(row,forms[1])">接口权限</a> &nbsp;
        <a  @click="handleRemove(row)">删除</a>
      </template>
    </Table>
    <Modal v-model="modalVisible"
           :title="modalTitle"
           width="40"
           @on-cancel="handleReset">
      <div>
        <Form ref="form1" v-show="current=='form1'" :model="formItem" :rules="formItemRules" :label-width="100">
          <FormItem label="上级菜单">
            <Input disabled v-model="value.menuName"></Input>
          </FormItem>
          <FormItem label="功能标识" prop="actionCode">
            <Input v-model="formItem.actionCode" placeholder="请输入内容"></Input>
            <span>菜单标识+自定义标识.默认后缀：View、Edit</span>
          </FormItem>
          <FormItem label="功能名称" prop="actionName">
            <Input v-model="formItem.actionName" placeholder="请输入内容"></Input>
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
            <Input v-model="formItem.actionDesc" type="textarea" placeholder="请输入内容"></Input>
          </FormItem>
        </Form>
        <Form ref="form2" v-show="current=='form2'" :model="formItem" :rules="formItemRules">
          <FormItem prop="authorities">
            <Transfer
              :data="selectApis"
              :list-style="{width: '45%',height: '480px'}"
              :titles="['选择接口', '已选择接口']"
              :render-format="transferRender"
              :target-keys="formItem.authorityIds"
              @on-change="handleTransferChange"
              filterable>
            </Transfer>
          </FormItem>
        </Form>
        <div class="drawer-footer">
          <Button type="default" @click="handleReset">取消</Button>&nbsp;
          <Button type="primary" @click="handleSubmit" :loading="saving">保存</Button>
        </div>
      </div>
    </Modal>
  </div>
</template>

<script>
  // import {
  //   getActionsByMenu,
  //   updateAction,
  //   addAction,
  //   removeAction,
  // } from '@/api/action'
  // import {
  //   getAuthorityApi,
  //   getAuthorityAction,
  //   grantAuthorityAction
  // } from '@/api/authority'

  export default {
    name: 'MenuAction',
    props: {
      value: Object
    },
    data () {
      const validateEn = (rule, value, callback) => {
        let reg = /^[_a-zA-Z0-9]+$/
        if (value === '') {
          callback(new Error('功能标识不能为空'))
        } else if (value !== '' && !reg.test(value)) {
          callback(new Error('只允许字母、数字、下划线'))
        } else {
          callback()
        }
      }
      return {
        modalVisible: false,
        saving: false,
        loading: false,
        current: 'form1',
        forms: [
          'form1',
          'form2'
        ],
        modalTitle: '',
        confirmModal: false,
        selectApis: [],
        formItemRules: {
          actionCode: [
            {required: true, validator: validateEn, message: '功能编码不能为空', trigger: 'blur'}
          ],
          actionName: [
            {required: true, message: '功能名称不能为空', trigger: 'blur'}
          ]
        },
        formItem: {
          actionId: '',
          actionCode: '',
          actionName: '',
          authorityIds: [],
          status: 1,
          menuId: '',
          priority: 0,
          actionDesc: ''
        },
        columns: [
          {
            title: '功能名称',
            slot: 'status',
            width: 150
          },
          {
            title: '功能编码',
            key: 'actionCode'
          },
          {
            title: '操作',
            slot: 'action',
            fixed: 'right',
            width: 160
          }
        ],
        data: []
      }
    },
    methods: {
      handleModal (data, step) {
        if (data) {
          this.formItem = Object.assign({}, this.formItem, data)
        }
        if (!step) {
          step = this.forms[0]
        }
        if (step === this.forms[0]) {
          this.modalTitle = data ? '编辑功能 - ' + this.value.menuName + ' > ' + data.actionName : '添加功能 - ' + this.value.menuName
          this.modalVisible = true
          this.formItem.actionCode = this.formItem.actionId ? this.formItem.actionCode : this.value.menuCode
        }
        if (step === this.forms[1]) {
          this.modalTitle = data ? '接口授权 - ' + this.value.menuName + ' > ' + data.actionName : '接口授权'
          this.handleLoadActionApi(this.formItem.actionId)
        }
        this.current = step
        this.formItem.status = this.formItem.status + ''
      },
      handleReset () {
        const newData = {
          actionId: '',
          actionCode: '',
          actionName: '',
          authorityIds: [],
          status: 1,
          priority: 0,
          actionDesc: ''
        }
        this.formItem = newData
        //重置验证
        this.forms.map(form => {
          this.$refs[form].resetFields()
        })
        this.current = this.forms[0]
        this.modalVisible = false
        this.saving = false
      },
      handleSubmit () {
        // if (this.current === this.forms[0]) {
        //   this.$refs[this.current].validate((valid) => {
        //     if (valid) {
        //       this.saving = true
        //       if (this.formItem.actionId) {
        //         updateAction(this.formItem).then(res => {
        //           this.handleReset()
        //           this.handleSearch()
        //           if (res.code === 0) {
        //             this.$Message.success('保存成功')
        //           }
        //         }).finally(() => {
        //           this.saving = false
        //         })
        //       } else {
        //         addAction(this.formItem).then(res => {
        //           this.handleReset()
        //           this.handleSearch()
        //           if (res.code === 0) {
        //             this.$Message.success('保存成功')
        //           }
        //         }).finally(() => {
        //           this.saving = false
        //         })
        //       }
        //     }
        //   })
        // }
        // if (this.current === this.forms[1]) {
        //   this.$refs[this.current].validate((valid) => {
        //     if (valid) {
        //       this.saving = true
        //       grantAuthorityAction({
        //         actionId: this.formItem.actionId,
        //         authorityIds: this.formItem.authorityIds
        //       }).then(res => {
        //         this.handleReset()
        //         this.handleSearch()
        //         if (res.code === 0) {
        //           this.$Message.success('绑定成功')
        //         }
        //       }).finally(() => {
        //         this.saving = false
        //       })
        //     }
        //   })
        // }

      },
      handleSearch () {
        if (!this.value || !this.value.menuId) {
          return
        }
        this.formItem.menuId = this.value.menuId
        // this.loading = true
        this.data=[{"createTime":"2019-05-24 18:05:15","updateTime":"2019-05-24 18:05:15","actionId":"1131863723722551297","actionCode":"systemAppView","actionName":"查看","menuId":"9","priority":0,"actionDesc":"","status":1,"isPersist":1,"serviceId":"open-cloud-base-server"},{"createTime":"2019-05-24 18:05:27","updateTime":"2019-05-24 18:05:27","actionId":"1131863775899693057","actionCode":"systemAppEdit","actionName":"编辑","menuId":"9","priority":0,"actionDesc":"","status":1,"isPersist":1,"serviceId":"open-cloud-base-server"}]
        // getActionsByMenu(this.formItem.menuId).then(res => {
        //   this.data = res.data
        // }).finally(() => {
        //   this.loading = false
        // })
      },
      handleRemove (data) {
        this.$Modal.confirm({
          title: '确定删除吗？',
          onOk: () => {
            removeAction(data.actionId).then(res => {
              this.handleSearch()
              if (res.code === 0) {
                this.pageInfo.page = 1
                this.$Message.success('删除成功')
              }
            })
          }
        })
      },
      handleLoadActionApi (actionId) {
        if (!actionId) {
          return
        }
        const that = this
        // const p1 = getAuthorityApi('')
        // const p2 = getAuthorityAction(actionId)
        // Promise.all([p1, p2]).then(function (values) {
          let values=[
            {"code":0,"message":"success","path":"","data":[{"createTime":"2019-07-30 11:07:04","updateTime":"2019-08-22 14:36:44","apiId":"1156038470987317250","apiCode":"b8c71f653aa802bbedf16c4ec9b20e3e","apiName":"获取当前登录用户信息-SSO单点登录","serviceId":"open-cloud-uaa-admin-server","apiCategory":"default","path":"/current/user/sso","priority":0,"apiDesc":"获取当前登录用户信息-SSO单点登录","status":1,"isPersist":1,"isAuth":1,"isOpen":0,"requestMethod":"GET","contentType":"","className":"com.opencloud.uaa.admin.server.controller.LoginController","methodName":"principal","authorityId":"1156038471020871682","authority":"API_b8c71f653aa802bbedf16c4ec9b20e3e","prefix":"/admin/**"},{"createTime":"2019-07-30 11:04:01","updateTime":"2019-08-19 18:59:18","apiId":"1156037705061269506","apiCode":"9275410ca1d4198af7a7e66b2661f422","apiName":"批量删除数据","serviceId":"open-cloud-base-server","apiCategory":"default","path":"/api/batch/remove","priority":0,"apiDesc":"批量删除数据","status":1,"isPersist":1,"isAuth":1,"isOpen":1,"requestMethod":"POST","contentType":"","className":"com.opencloud.base.server.controller.BaseApiController","methodName":"batchRemove","authorityId":"1156037705195487233","authority":"API_9275410ca1d4198af7a7e66b2661f422","prefix":"/base/**"},{"createTime":"2019-07-30 11:04:01","updateTime":"2019-08-21 11:44:34","apiId":"1156037705921101825","apiCode":"de9889498a75766df0dd9644b21b07bf","apiName":"批量修改公开状态","serviceId":"open-cloud-base-server","apiCategory":"default","path":"/api/batch/update/open","priority":0,"apiDesc":"批量修改公开状态","status":1,"isPersist":1,"isAuth":1,"isOpen":1,"requestMethod":"POST","contentType":"","className":"com.opencloud.base.server.controller.BaseApiController","methodName":"batchUpdateOpen","authorityId":"1156037705963044866","authority":"API_de9889498a75766df0dd9644b21b07bf","prefix":"/base/**"},{"createTime":"2019-07-30 11:04:01","updateTime":"2019-08-21 11:44:26","apiId":"1156037706126622721","apiCode":"f7244837c4701df4f47e540682405e5e","apiName":"批量修改身份认证","serviceId":"open-cloud-base-server","apiCategory":"default","path":"/api/batch/update/auth","priority":0,"apiDesc":"批量修改身份认证","status":1,"isPersist":1,"isAuth":1,"isOpen":1,"requestMethod":"POST","contentType":"","className":"com.opencloud.base.server.controller.BaseApiController","methodName":"batchUpdateAuth","authorityId":"1156037706155982850","authority":"API_f7244837c4701df4f47e540682405e5e","prefix":"/base/**"},{"createTime":"2019-07-30 11:04:01","updateTime":"2019-08-19 18:59:18","apiId":"1156037706206314497","apiCode":"1c335308b42f13c97e2f41ae42418f56","apiName":"批量修改状态","serviceId":"open-cloud-base-server","apiCategory":"default","path":"/api/batch/update/status","priority":0,"apiDesc":"批量修改状态","status":1,"isPersist":1,"isAuth":1,"isOpen":1,"requestMethod":"POST","contentType":"","className":"com.opencloud.base.server.controller.BaseApiController","methodName":"batchUpdateStatus","authorityId":"1156037706244063234","authority":"API_1c335308b42f13c97e2f41ae42418f56","prefix":"/base/**"}]},
            {"code":0,"message":"success","path":"","data":[{"createTime":"2019-08-22 14:54:41","updateTime":"2019-08-22 14:54:41","actionId":"1131863723722551297","authorityId":"1149168011243085826"},{"createTime":"2019-08-22 14:54:41","updateTime":"2019-08-22 14:54:41","actionId":"1131863723722551297","authorityId":"1149168011545075713"},{"createTime":"2019-08-22 14:54:41","updateTime":"2019-08-22 14:54:41","actionId":"1131863723722551297","authorityId":"1149168011599601666"},{"createTime":"2019-08-22 14:54:41","updateTime":"2019-08-22 14:54:41","actionId":"1131863723722551297","authorityId":"1131813663404134402"},{"createTime":"2019-08-22 14:54:41","updateTime":"2019-08-22 14:54:41","actionId":"1131863723722551297","authorityId":"1132203893955006465"},{"createTime":"2019-08-22 14:54:41","updateTime":"2019-08-22 14:54:41","actionId":"1131863723722551297","authorityId":"1132203893384581121"},{"createTime":"2019-08-22 14:54:41","updateTime":"2019-08-22 14:54:41","actionId":"1131863723722551297","authorityId":"1132203893577519106"}],"extra":{},"timestamp":"1583919096198"}
          ]
          let res1 = values[0]
          let res2 = values[1]
          if (res1.code === 0) {
            res1.data.map(item => {
              item.key = item.authorityId
              item.label = `${item.prefix.replace('/**', '')}${item.path} - ${item.apiName}`
              item.disabled = item.path === '/**'
            })
            that.selectApis = res1.data
          }
          if (res2.code === 0) {
            const result = []
            res2.data.map(item => {
              if (!result.includes(item.authorityId)) {
                result.push(item.authorityId)
              }
            })
            that.formItem.authorityIds = result
          }
          that.modalVisible = true
        // })
      },
      transferRender (item) {
        return `<span  title="${item.label}">${item.label}</span>`
      },
      handleTransferChange (newTargetKeys, direction, moveKeys) {
        if (newTargetKeys.indexOf('1') != -1) {
          this.formItem.authorityIds = ['1']
        } else {
          this.formItem.authorityIds = newTargetKeys
        }
      },
    },
    watch: {
      value (val) {
        this.handleSearch()
      }
    },
    mounted: function () {
    }
  }
</script>
