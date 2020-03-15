<template>
  <div>
    <Card shadow>
      <Form ref="searchForm"
            :model="pageInfo"
            inline
            :label-width="80">
        <FormItem label="AppId" prop="appId">
          <Input type="text" v-model="pageInfo.appId" placeholder="请输入关键字"/>
        </FormItem>
        <FormItem label="中文名称" prop="appName">
          <Input type="text" v-model="pageInfo.appName" placeholder="请输入关键字"/>
        </FormItem>
        <FormItem label="英文名称" prop="appName">
          <Input type="text" v-model="pageInfo.appNameEn" placeholder="请输入关键字"/>
        </FormItem>
        <FormItem>
          <Button type="primary" @click="handleSearch(1)">查询</Button>&nbsp;
          <Button @click="handleResetForm('searchForm')">重置</Button>
        </FormItem>
      </Form>
      <div class="search-con search-con-top">
        <ButtonGroup>
          <Button class="search-btn" type="primary"
                  @click="handleModal()">
            <span>添加</span>
          </Button>
        </ButtonGroup>
      </div>
      <Alert type="info" show-icon>客户端模式,请授权相关接口资源。否则请求网关服务器将提示<code>"权限不足,拒绝访问!"</code></Alert>
      <Table border :columns="columns" :data="data" :loading="loading">
        <template slot="status" slot-scope="{ row }">
          <Badge v-if="row.status===1" status="success" text="上线"/>
          <Badge v-else="" status="error" text="下线"/>
        </template>
        <template slot="appType" slot-scope="{ row }">
          <Tag color="blue" v-if="row.appType==='server'">服务器应用</Tag>
          <Tag color="blue" v-else-if="row.appType==='app'">手机应用</Tag>
          <Tag color="blue" v-else-if="row.appType==='pc'">PC网页应用</Tag>
          <Tag color="blue" v-else="">手机网页应用</Tag>
        </template>
        <template slot="action" slot-scope="{ row }">
          <a @click="handleModal(row)" :disabled="row.appId != 'gateway' ?false:true">
            编辑</a>&nbsp;
          <Dropdown transfer ref="dropdown" @on-click="handleClick($event,row)">
            <a href="javascript:void(0)" :disabled="row.appId === 'gateway' ?true:false">
              <span>更多</span>
              <Icon type="ios-arrow-down"></Icon>
            </a>
            <DropdownMenu slot="list">
              <DropdownItem name="resetSecret">重置密钥</DropdownItem>
              <DropdownItem name="remove">删除应用</DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </template>
      </Table>
      <Page transfer :total="pageInfo.total" :current="pageInfo.page" :page-size="pageInfo.limit" show-elevator
            show-sizer
            show-total
            @on-change="handlePage" @on-page-size-change='handlePageSize'></Page>
    </Card>

    <Modal v-model="modalVisible"
           :title="modalTitle"
           width="40"
           @on-cancel="handleReset">
      <div>
        <Tabs :value="current" @on-click="handleTabClick">
          <TabPane label="应用信息" name="form1">
            <Form ref="form1" v-show="current=='form1'" :model="formItem" :rules="formItemRules" :label-width="135">
              <FormItem label="应用图标">
                <div class="upload-list" v-for="item in uploadList">
                  <template v-if="item.status === 'finished'">
                    <img :src="item.url">
                    <div class="upload-list-cover">
                      <Icon type="ios-eye-outline" @click.native="handleView(item.name)"></Icon>
                      <Icon type="ios-trash-outline" @click.native="handleRemoveImg(item)"></Icon>
                    </div>
                  </template>
                  <template v-else>
                    <Progress v-if="item.showProgress" :percent="item.percentage" hide-info></Progress>
                  </template>
                </div>
                <Upload
                  ref="upload"
                  :show-upload-list="false"
                  :default-file-list="defaultList"
                  :format="['jpg','jpeg','png']"
                  :max-size="2048"
                  :on-success="handleSuccess"
                  :on-format-error="handleFormatError"
                  :on-exceeded-size="handleMaxSize"
                  :before-upload="handleBeforeUpload"
                  type="drag"
                  action="//jsonplaceholder.typicode.com/posts/"
                  style="display: inline-block;width:58px;">
                  <div style="width: 58px;height:58px;line-height: 58px;">
                    <Icon type="ios-camera" size="20"></Icon>
                  </div>
                </Upload>
              </FormItem>
              <FormItem label="AppId">
                <Input disabled v-model="formItem.appId" placeholder="请输入内容"></Input>
              </FormItem>
              <FormItem label="开发者">
                <Select v-model="formItem.developerId" filterable clearable>
                  <Option :title="item.userName" v-for="item in selectUsers" @click.native="handleOnSelectUser(item)"
                          :value="item.userId" :label="item.userName">
                    <span>{{ item.userName }}</span>
                  </Option>
                </Select>
              </FormItem>
              <FormItem label="应用名称" prop="appName">
                <Input v-model="formItem.appName" placeholder="请输入内容"></Input>
              </FormItem>
              <FormItem label="英文名称" prop="appNameEn">
                <Input v-model="formItem.appNameEn" placeholder="请输入内容"></Input>
              </FormItem>
              <FormItem label="应用类型" prop="appType">
                <Select v-model="formItem.appType" @on-change="handleOnAppTypeChange">
                  <Option value="server">服务器应用</Option>
                  <Option value="app">手机应用</Option>
                  <Option value="pc">PC网页应用</Option>
                  <Option value="wap">手机网页应用</Option>
                </Select>
              </FormItem>
              <FormItem v-if="formItem.appType === 'app'" prop="appOs" label="操作系统">
                <RadioGroup v-model="formItem.appOs">
                  <Radio label="ios">
                    <Icon type="logo-apple"></Icon>
                    <span>苹果IOS</span>
                  </Radio>
                  <Radio label="android">
                    <Icon type="logo-android"></Icon>
                    <span>安卓Android</span>
                  </Radio>
                </RadioGroup>
              </FormItem>
              <FormItem label="应用官网" prop="website">
                <Input v-model="formItem.website" placeholder="请输入内容"></Input>
              </FormItem>
              <FormItem label="状态">
                <RadioGroup v-model="formItem.status" type="button">
                  <Radio label="0">下线</Radio>
                  <Radio label="1">上线</Radio>
                </RadioGroup>
              </FormItem>
              <FormItem label="描述">
                <Input v-model="formItem.appDesc" type="textarea" placeholder="请输入内容"></Input>
              </FormItem>
            </Form>
          </TabPane>
          <TabPane :disabled="!formItem.appId" label="开发信息" name="form2">
            <Form ref="form2" v-show="current=='form2'" :model="formItem" :rules="formItemRules" :label-width="135">
              <FormItem label="ApiKey">
                <Input disabled v-model="formItem.apiKey" placeholder="请输入内容"></Input>
              </FormItem>
              <FormItem label="SecretKey">
                <Input disabled v-model="formItem.secretKey" placeholder="请输入内容"></Input>
              </FormItem>
              <FormItem label="授权类型" prop="grantTypes">
                <CheckboxGroup v-model="formItem.grantTypes">
                  <Tooltip :content="item.desc" v-for="item in selectGrantTypes">
                    <Checkbox :label="item.label"><span>{{ item.title }}</span></Checkbox>
                  </Tooltip>
                </CheckboxGroup>
              </FormItem>
              <FormItem label="用户授权范围" prop="scopes">
            <span slot="label">用户授权范围
            <Tooltip content="提醒用户确认授权可访问的资源">
              <Icon type="ios-alert" size="16"/>
            </Tooltip>
            </span>
                <CheckboxGroup v-model="formItem.scopes">
                  <Checkbox v-for="item in selectScopes" :label="item.label"><span>{{ item.title }}</span>
                  </Checkbox>
                </CheckboxGroup>
              </FormItem>
              <FormItem label="自动授权范围">
            <span slot="label">自动授权范围
              <Tooltip content="不再提醒用户确认授权可访问的资源">
              <Icon type="ios-alert" size="16"/>
            </Tooltip>
            </span>
                <CheckboxGroup v-model="formItem.autoApproveScopes">
                  <Checkbox v-for="item in selectScopes" :label="item.label"><span>{{ item.title }}</span>
                  </Checkbox>
                </CheckboxGroup>
              </FormItem>
              <FormItem label="令牌有效期" prop="accessTokenValidity">
                <RadioGroup v-model="formItem.tokenValidity" type="button">
                  <Radio label="1">设置有效期</Radio>
                  <Radio label="0">不限制</Radio>
                </RadioGroup>
              </FormItem>
              <FormItem v-show="formItem.tokenValidity === '1'" label="访问令牌有效期" prop="accessTokenValidity">
                <InputNumber :min="900" v-model="formItem.accessTokenValidity"></InputNumber>
                <span>&nbsp;&nbsp;秒</span>
              </FormItem>
              <FormItem v-show="formItem.tokenValidity === '1'" label="刷新令牌有效期" prop="refreshTokenValidity">
                <InputNumber :min="900" v-model="formItem.refreshTokenValidity"></InputNumber>
                <span>&nbsp;&nbsp;秒</span>
              </FormItem>
              <FormItem label="第三方登陆回调地址" prop="redirectUrls">
                <Input v-model="formItem.redirectUrls" type="textarea" placeholder="请输入内容"></Input>
                <span>多个地址使用,逗号隔开</span>
              </FormItem>
            </Form>
          </TabPane>
          <TabPane :disabled="!formItem.appId" label="分配权限" name="form3">
            <Form ref="form3" v-show="current=='form3'" :model="formItem"  :label-width="100" :rules="formItemRules">
              <FormItem prop="expireTime" label="过期时间">
                <Badge v-if="formItem.isExpired" text="授权已过期">
                  <DatePicker v-model="formItem.expireTime" class="ivu-form-item-error" type="datetime"
                              placeholder="授权有效期"></DatePicker>
                </Badge>
                <DatePicker v-else="" v-model="formItem.expireTime" type="datetime" placeholder="设置有效期"></DatePicker>
              </FormItem>
              <FormItem prop="authorities" label="功能接口" >
                <Transfer
                  :data="selectApis"
                  :list-style="{width: '45%',height: '480px'}"
                  :titles="['选择接口', '已选择接口']"
                  :render-format="transferRender"
                  :target-keys="formItem.authorities"
                  @on-change="handleTransferChange"
                  filterable>
                </Transfer>
              </FormItem>
            </Form>
          </TabPane>
        </Tabs>
        <div class="drawer-footer">
          <Button type="default" @click="handleReset">取消</Button>&nbsp;
          <Button type="primary" @click="handleSubmit" :loading="saving">保存</Button>
        </div>
      </div>
    </Modal>
  </div>
</template>

<script>
  // import {getApps, updateApp, addApp, removeApp, getAppClientInfo, updateAppClientInfo, restApp} from '@/api/app'
  // import {getAllDevelopers} from '@/api/developer'
  // import {startWith, listConvertGroup} from '@/libs/util'
  // import {
  //   getAuthorityApi,
  //   getAuthorityApp,
  //   grantAuthorityApp
  // } from '@/api/authority'

  export default {
    name: 'SystemApp',
    data () {
      const validateEn = (rule, value, callback) => {
        let reg = /^[-_a-zA-Z0-9]+$/
        if (value === '') {
          callback(new Error('英文不能为空'))
        } else if (value !== '' && !reg.test(value)) {
          callback(new Error('只允许字母、数字、下划线、横线'))
        } else {
          callback()
        }
      }
      return {
        loading: false,
        saving: false,
        current: 'form1',
        forms: [
          'form1',
          'form2',
          'form3'
        ],
        selectApis: [],
        selectUsers: [],
        selectGrantTypes: [
          {label: 'authorization_code', title: '授权码模式', desc: 'Web服务端应用与第三方移动App应用'},
          {label: 'client_credentials', title: '客户端模式', desc: '没有用户参与的,内部服务端与第三方服务端'},
          {label: 'password', title: '密码模式', desc: '内部Web网页应用与内部移动App应用'},
          {label: 'implicit', title: '简化模式', desc: 'Web网页应用或第三方移动App应用'},
          {label: 'refresh_token', title: '刷新令牌', desc: '刷新并延迟访问令牌时长'},
        ],
        selectScopes: [
          {label: 'userProfile', title: '允许访问基本信息'},
          // 这是测试数据,自定义对应接口权限标识
          {label: 'api1', title: '允许访问....自定义信息'},
        ],
        pageInfo: {
          total: 0,
          page: 1,
          limit: 10,
          appId: '',
          appName: '',
          appNameEn: ''
        },
        defaultList: [
          {
            'name': '',
            'url': ''
          }
        ],
        modalVisible: false,
        modalTitle: '',
        imgName: '',
        visible: false,
        uploadList: [],
        formItemRules: {
          website: [
            {type: 'url', message: '请输入有效网址', trigger: 'blur'}
          ],
          appType: [
            {required: true, message: '应用类型不能为空', trigger: 'blur'}
          ],
          appOs: [
            {required: true, message: '操作系统不能为空', trigger: 'blur'}
          ],
          redirectUrls: [
            {required: true, message: '授权重定向地址不能为空', trigger: 'blur'}
          ],
          appName: [
            {required: true, message: '应用名称不能为空', trigger: 'blur'}
          ],
          appNameEn: [
            {required: true, validator: validateEn, trigger: 'blur'}
          ],
          grantTypes: [
            {required: true, type: 'array', min: 1, message: '授权类型不能为空', trigger: 'blur'}
          ],
          scopes: [
            {required: true, type: 'array', min: 1, message: '用户授权范围不能为空', trigger: 'blur'}
          ],
          accessTokenValidity: [
            {required: true, type: 'integer', min: 900, message: '访问令牌有效期不能少于900', trigger: 'blur'}
          ],
          refreshTokenValidity: [
            {required: true, type: 'integer', min: 900, message: '刷新令牌有效期不能少于900', trigger: 'blur'}
          ],
        },
        formItem: {
          appId: '',
          apiKey: '',
          secretKey: '',
          appName: '',
          appNameEn: '',
          appType: 'server',
          appIcon: '',
          appOs: '',
          path: '',
          website: '',
          appDesc: '',
          status: 1,
          redirectUrls: '',
          developerId: '',
          scopes: ['userProfile'],
          autoApproveScopes: [],
          authorities: [],
          grantTypes: [],
          accessTokenValidity: 43200,
          refreshTokenValidity: 2592000,
          expireTime: '',
          isExpired: false,
          tokenValidity: '1'
        },
        columns: [
          {
            type: 'selection',
            width: 60,
            align: 'center'
          },
          {
            title: '应用名称',
            key: 'appName',
            width: 200
          },
          {
            title: 'AppId',
            key: 'appId',
            width: 200
          },
          {
            title: 'ApiKey',
            key: 'apiKey',
            width: 250
          },
          {
            title: 'SecretKey',
            key: 'secretKey',
            width: 300
          },
          {
            title: '开发者',
            key: 'userName',
            width: 200
          },
          {
            title: '应用类型',
            slot: 'appType',
            width: 180,
            filters: [
              {
                label: '服务器应用',
                value: 0
              },
              {
                label: '手机应用',
                value: 1
              },
              {
                label: 'PC网页应用',
                value: 2
              },
              {
                label: '手机网页应用',
                value: 3
              }
            ],
            filterMultiple: false,
            filterMethod (value, row) {
              if (value === 0) {
                return row.appType === 'server'
              } else if (value === 1) {
                return row.appType === 'app'
              } else if (value === 2) {
                return row.appType === 'pc'
              } else if (value === 3) {
                return row.appType === 'wap'
              }
            }
          },
          {
            title: '状态',
            slot: 'status',
            key: 'status'
          },
          {
            title: '操作',
            slot: 'action',
            fixed: 'right',
            width: 120
          }
        ],
        data: []
      }
    },
    methods: {
      handleModal (data) {
        if (data) {
          this.formItem = Object.assign({}, this.formItem, data)
          this.formItem.appId = data.appId
        }
        if (this.current === this.forms[0]) {
          this.modalTitle = data ? '编辑应用 - ' + data.appName : '添加应用'
          this.handleLoadUsers()
        }
        if (this.current === this.forms[1]) {
          this.modalTitle = data ? '开发信息 - ' + data.appName : '开发信息'
          this.handleLoadAppClientInfo(this.formItem.apiKey)
        }
        if (this.current === this.forms[2]) {
          this.modalTitle = data ? '分配权限 - ' + data.appName : '分配权限'
          this.handleLoadAppGranted(this.formItem.appId)
        }
        this.formItem.status = this.formItem.status + ''
      },
      handleResetForm (form) {
        this.$refs[form].resetFields()
      },
      handleReset () {
        //重置验证
        const newData = {
          appId: '',
          apiKey: '',
          secretKey: '',
          appName: '',
          appNameEn: '',
          appType: 'server',
          appIcon: '',
          appOs: '',
          path: '',
          website: '',
          appDesc: '',
          status: 1,
          redirectUrls: '',
          developerId: '',
          scopes: ['userProfile'],
          autoApproveScopes: [],
          authorities: [],
          grantTypes: [],
          accessTokenValidity: 43200,
          refreshTokenValidity: 2592000,
          expireTime: '',
          isExpired: false,
          tokenValidity: '1'
        }
        this.formItem = newData
        this.forms.map(form => {
          this.handleResetForm(form)
        })
        this.current = this.forms[0]
        this.saving = false
        this.modalVisible = false
      },
      handleSubmit () {
        // if (this.current === this.forms[0]) {
        //   this.$refs[this.current].validate((valid) => {
        //     if (valid) {
        //       this.saving = true
        //       const data = Object.assign({}, this.formItem)
        //       if (data.appId) {
        //         updateApp(data).then(res => {
        //           if (res.code === 0) {
        //             this.$Message.success('保存成功')
        //           }
        //           this.handleReset()
        //           this.handleSearch()
        //         }).finally(() => {
        //           this.saving = false
        //         })
        //       } else {
        //         addApp(data).then(res => {
        //           if (res.code === 0) {
        //             this.$Message.success('保存成功')
        //           }
        //           this.handleReset()
        //           this.handleSearch()
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
        //       if (this.formItem.tokenValidity === '0') {
        //         this.formItem.accessTokenValidity = -1
        //         this.formItem.refreshTokenValidity = -1
        //       }
        //       updateAppClientInfo(this.formItem).then(res => {
        //         if (res.code === 0) {
        //           this.$Message.success('保存成功')
        //         }
        //         this.handleReset()
        //         this.handleSearch()
        //       }).finally(() => {
        //         this.saving = false
        //       })
        //     }
        //   })
        // }

        // if (this.current === this.forms[2]) {
        //   this.$refs[this.current].validate((valid) => {
        //     if (valid) {
        //       this.saving = true
        //       grantAuthorityApp({
        //         appId: this.formItem.appId,
        //         expireTime: this.formItem.expireTime ? this.formItem.expireTime.pattern('yyyy-MM-dd HH:mm:ss') : '',
        //         authorityIds: this.formItem.authorities
        //       }).then(res => {
        //         if (res.code === 0) {
        //           this.$Message.success('授权成功')
        //           this.handleReset()
        //         }
        //         this.handleSearch()
        //       }).finally(() => {
        //         this.saving = false
        //       })
        //     }
        //   })
        // }
      },
      handleSearch(page) {
        this.data=[{"apiKey":"7gBZcbsC7kLIWCdELIl8nxcs","appDesc":"资源服务器","appIcon":"","appId":"1552274783265","appName":"平台用户认证服务器","appNameEn":"open-cloud-uaa-admin-server","appOs":"","appType":"server","createTime":"2018-11-12 17:48:45","developerId":"0","isPersist":1,"secretKey":"0osTIhce7uPvDKHz6aa67bhCukaKoYl4","status":1,"updateTime":"2019-07-11 18:31:05","website":"http://www.baidu.com"},{"apiKey":"rOOM15Zbc3UFWgW2h71gRFvi","appDesc":"sso","appIcon":"","appId":"1552294656514","appName":"SSO单点登录DEMO","appNameEn":"sso-demo","appOs":"","appType":"server","createTime":"2018-11-12 17:48:45","developerId":"0","isPersist":1,"secretKey":"2Iw2B0UCMYd1cZjt8Fpr4KJUx75wQCwW","status":1,"updateTime":"2019-07-11 18:31:05","website":"http://www.baidu.com"}]
         // if (page) {
        //   this.pageInfo.page = page
        // }
        // this.loading = true
        // getApps(this.pageInfo).then(res => {
        //   this.data = res.data.records
        //   this.pageInfo.total = parseInt(res.data.total)
        // }).finally(() => {
        //   this.loading = false
        // })
      },
      handleRemove (data) {
        this.$Modal.confirm({
          title: '删除后将无法恢复,确定删除吗？',
          onOk: () => {
            removeApp({appId: data.appId}).then(res => {
              this.handleSearch()
              if (res.code === 0) {
                this.pageInfo.page = 1
                this.$Message.success('删除成功')
              }
            })
          }
        })
      },
      handleResetSecret (data) {
        this.$Modal.confirm({
          title: '重置后将影响应用正常使用,确定重置吗？',
          onOk: () => {
            restApp({appId: data.appId}).then(res => {
              if (res.code === 0) {
                this.pageInfo.page = 1
                this.formItem.secretKey = res.data
                this.$Message.success('重置成功,请妥善保管.并及时更新到相关应用')
              }
              this.handleSearch()
            })
          }
        })
      },
      handleTabClick(name){
        this.current = name
        this.handleModal();
      },
      handleClick (name, row) {
        switch (name) {
          case 'remove':
            this.handleRemove(row)
            break
          case 'resetSecret':
            this.handleResetSecret(row)
            break
        }
      },
      handleOnAppTypeChange (data) {
        if (data !== 'app') {
          this.formItem.appOs = ''
        } else {
          if (!this.formItem.appOs) {
            this.formItem.appOs = 'ios'
          }
        }
      },
      handleOnSelectUser (data) {
        this.formItem.developerId = data.userId
      },
      handlePage (current) {
        this.pageInfo.page = current
        this.handleSearch()
      }
      ,
      handlePageSize (size) {
        this.pageInfo.limit = size
        this.handleSearch()
      },
      handleLoadAppGranted (appId) {
        if (!appId) {
          return
        }
        const that = this
        // const p1 = getAuthorityApi('')
        // const p2 = getAuthorityApp(appId)
        // Promise.all([p1, p2]).then(function (values) {
          let values=[
            {"code":0,"message":"success","path":"","data":[{"createTime":"2019-07-30 11:07:04","updateTime":"2019-08-22 14:36:44","apiId":"1156038470987317250","apiCode":"b8c71f653aa802bbedf16c4ec9b20e3e","apiName":"获取当前登录用户信息-SSO单点登录","serviceId":"open-cloud-uaa-admin-server","apiCategory":"default","path":"/current/user/sso","priority":0,"apiDesc":"获取当前登录用户信息-SSO单点登录","status":1,"isPersist":1,"isAuth":1,"isOpen":0,"requestMethod":"GET","contentType":"","className":"com.opencloud.uaa.admin.server.controller.LoginController","methodName":"principal","authorityId":"1156038471020871682","authority":"API_b8c71f653aa802bbedf16c4ec9b20e3e","prefix":"/admin/**"},{"createTime":"2019-07-30 11:04:01","updateTime":"2019-08-19 18:59:18","apiId":"1156037705061269506","apiCode":"9275410ca1d4198af7a7e66b2661f422","apiName":"批量删除数据","serviceId":"open-cloud-base-server","apiCategory":"default","path":"/api/batch/remove","priority":0,"apiDesc":"批量删除数据","status":1,"isPersist":1,"isAuth":1,"isOpen":1,"requestMethod":"POST","contentType":"","className":"com.opencloud.base.server.controller.BaseApiController","methodName":"batchRemove","authorityId":"1156037705195487233","authority":"API_9275410ca1d4198af7a7e66b2661f422","prefix":"/base/**"},{"createTime":"2019-07-30 11:04:01","updateTime":"2019-08-21 11:44:34","apiId":"1156037705921101825","apiCode":"de9889498a75766df0dd9644b21b07bf","apiName":"批量修改公开状态","serviceId":"open-cloud-base-server","apiCategory":"default","path":"/api/batch/update/open","priority":0,"apiDesc":"批量修改公开状态","status":1,"isPersist":1,"isAuth":1,"isOpen":1,"requestMethod":"POST","contentType":"","className":"com.opencloud.base.server.controller.BaseApiController","methodName":"batchUpdateOpen","authorityId":"1156037705963044866","authority":"API_de9889498a75766df0dd9644b21b07bf","prefix":"/base/**"},{"createTime":"2019-07-30 11:04:01","updateTime":"2019-08-21 11:44:26","apiId":"1156037706126622721","apiCode":"f7244837c4701df4f47e540682405e5e","apiName":"批量修改身份认证","serviceId":"open-cloud-base-server","apiCategory":"default","path":"/api/batch/update/auth","priority":0,"apiDesc":"批量修改身份认证","status":1,"isPersist":1,"isAuth":1,"isOpen":1,"requestMethod":"POST","contentType":"","className":"com.opencloud.base.server.controller.BaseApiController","methodName":"batchUpdateAuth","authorityId":"1156037706155982850","authority":"API_f7244837c4701df4f47e540682405e5e","prefix":"/base/**"},{"createTime":"2019-07-30 11:04:01","updateTime":"2019-08-19 18:59:18","apiId":"1156037706206314497","apiCode":"1c335308b42f13c97e2f41ae42418f56","apiName":"批量修改状态","serviceId":"open-cloud-base-server","apiCategory":"default","path":"/api/batch/update/status","priority":0,"apiDesc":"批量修改状态","status":1,"isPersist":1,"isAuth":1,"isOpen":1,"requestMethod":"POST","contentType":"","className":"com.opencloud.base.server.controller.BaseApiController","methodName":"batchUpdateStatus","authorityId":"1156037706244063234","authority":"API_1c335308b42f13c97e2f41ae42418f56","prefix":"/base/**"},{"createTime":"2019-07-23 13:56:54","updateTime":"2019-08-19 18:55:50","apiId":"1153544494694670337","apiCode":"4d27a9ae885d7dbfc82e7ae2c86ec9d6","apiName":"login","serviceId":"open-cloud-uaa-admin-server","apiCategory":"default","path":"/login","priority":0,"apiDesc":"","status":1,"isPersist":1,"isAuth":0,"isOpen":0,"requestMethod":"GET","contentType":"","className":"com.opencloud.uaa.admin.server.controller.IndexController","methodName":"login","authorityId":"1153544494724030465","authority":"API_4d27a9ae885d7dbfc82e7ae2c86ec9d6","prefix":"/admin/**"}]},
            {"code":0,"message":"success","path":"","data":[],"extra":{},"timestamp":"1583919096198"}
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
            let authorities = []
            res2.data.map(item => {
              if (item.authority.indexOf('APP_') === -1 && !authorities.includes(item.authorityId)) {
                authorities.push(item.authorityId)
              }
            })
            that.formItem.authorities = authorities;
            // 时间
            if (res2.data.length > 0) {
              that.formItem.expireTime = res2.data[0].expireTime
              that.formItem.isExpired = res2.data[0].isExpired
            }
          }
          that.modalVisible = true
        // })
      },
      handleLoadAppClientInfo (clientId) {
        if (!clientId) {
          return
        }
        // getAppClientInfo({clientId: clientId}).then(res => {
          let res={"code":0,"message":"success","path":"","data":{"scope":["userProfile"],"client_id":"7gBZcbsC7kLIWCdELIl8nxcs","client_secret":"$2a$10$4di0sSQdr9yk4uTKWtZqzedsxI8sWXoR67x.G.Qmy4K2L7ZaFQt6W","authorized_grant_types":["authorization_code","client_credentials","password"],"redirect_uri":["http://localhost:8888/login","http://localhost:8888/webjars/springfox-swagger-ui/o2c.html","http://www.baidu.com"],"autoapprove":[],"access_token_validity":43200,"refresh_token_validity":2592000,"additional_information":{"apiKey":"7gBZcbsC7kLIWCdELIl8nxcs","appDesc":"资源服务器","appIcon":"","appId":"1552274783265","appName":"平台用户认证服务器","appNameEn":"open-cloud-uaa-admin-server","appOs":"","appType":"server","createTime":"1542016125000","developerId":0,"isPersist":1,"secretKey":"0osTIhce7uPvDKHz6aa67bhCukaKoYl4","status":1,"updateTime":"1562841065000","website":"http://www.baidu.com"}},"extra":{},"timestamp":"1583920427236"}
          if (res.code === 0) {
            this.formItem.scopes = res.data.scope ? res.data.scope : []
            this.formItem.redirectUrls = res.data.redirect_uri ? res.data.redirect_uri.join(',') : ''
            this.formItem.grantTypes = res.data.authorized_grant_types ? res.data.authorized_grant_types : []
            this.formItem.accessTokenValidity = res.data.access_token_validity
            this.formItem.refreshTokenValidity = res.data.refresh_token_validity
            this.formItem.autoApproveScopes = res.data.autoapprove ? res.data.autoapprove : []
            this.formItem.tokenValidity = this.formItem.accessTokenValidity === -1 ? '0' : '1';
          }
          this.modalVisible = true
        // })
      },
      transferRender (item) {
        return `<span  title="${item.label}">${item.label}</span>`
      },
      handleTransferChange (newTargetKeys, direction, moveKeys) {
        if (newTargetKeys.indexOf('1') != -1) {
          this.formItem.authorities = ['1']
        } else {
          this.formItem.authorities = newTargetKeys
        }
      },
      handleLoadUsers () {
        // getAllDevelopers().then(res => {
        //   if (res.code === 0) {
        //     this.selectUsers = res.data
        //   }
          this.modalVisible = true
        // })
      },
      handleView (name) {
        this.imgName = name
        this.visible = true
      }
      ,
      handleRemoveImg (file) {
        const fileList = this.$refs.upload.fileList
        this.$refs.upload.fileList.splice(fileList.indexOf(file), 1)
      }
      ,
      handleSuccess (res, file) {
        file.url = ''
        file.name = ''
      }
      ,
      handleFormatError (file) {
        this.$Message.warning('图片支持png、jpg、jpeg')
      }
      ,
      handleMaxSize (file) {
        this.$Message.warning('图片大小不能超过2M.')
      }
      ,
      handleBeforeUpload () {
        const check = this.uploadList.length < 1
        if (!check) {
          this.$Message.warning('只能上传一张.')
        }
        return check
      }
    },
    mounted: function () {
      this.handleSearch()
    }
  }
</script>
<style scoped>
  .upload-list {
    display: inline-block;
    width: 60px;
    height: 60px;
    text-align: center;
    line-height: 60px;
    border: 1px solid transparent;
    border-radius: 4px;
    overflow: hidden;
    background: #fff;
    position: relative;
    box-shadow: 0 1px 1px rgba(0, 0, 0, .2);
    margin-right: 4px;
  }

  .upload-list img {
    width: 100%;
    height: 100%;
  }

  .upload-list-cover {
    display: none;
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    background: rgba(0, 0, 0, .6);
  }

  .upload-list:hover .upload-list-cover {
    display: block;
  }

  .upload-list-cover i {
    color: #fff;
    font-size: 20px;
    cursor: pointer;
    margin: 0 2px;
  }
</style>
