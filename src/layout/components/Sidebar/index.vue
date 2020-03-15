<template>
  <div :class="{'has-logo':showLogo}">
    <logo
      v-if="showLogo"
      :collapse="isCollapse"
    />
    <el-scrollbar wrap-class="scrollbar-wrapper">
      <el-menu
        :default-active="activeMenu"
        :collapse="isCollapse"
        :background-color="variables.menuBg"
        :text-color="variables.menuText"
        :unique-opened="false"
        :active-text-color="variables.menuActiveText"
        :collapse-transition="false"
        mode="vertical"
      >
        <sidebar-item
          v-for="route in routes"
          :key="route.path"
          :item="route"
          :base-path="route.path"
        />
      </el-menu>
    </el-scrollbar>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import { getSilderMenus } from '@/settings/MenuSettings'
import Logo from "./Logo";
import SidebarItem from "./SidebarItem";
import variables from "@/settings/variables.scss";
import elScrollbar from "@/components/Scrollbar/src/main";
import elMenu from "@/components/Menu/src/menu";
export default {
  components: { SidebarItem, Logo ,elScrollbar,elMenu},
  computed: {
    ...mapGetters(["sidebar"]),
    routes() {
      // 左侧导航菜单json数据
      return getSilderMenus()
    },
    activeMenu() {
      const route = this.$route;
      const { meta, path } = route;
      // 如果设置了activeMenu，则是选中了状态
      if (meta.activeMenu) {
        return meta.activeMenu;
      }
      return path;
    },
    showLogo() {
      return this.$store.state.settings.sidebarLogo;
    },
    variables() {
      return variables;
    },
    isCollapse() {
      return !this.sidebar.opened;
    }
  }
};
</script>
