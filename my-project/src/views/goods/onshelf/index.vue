<template>
  <div class="container">
    <Breadcrumb :items="['menu.list', 'menu.list.searchTable']" />
    <div class="component-container bg-white rounded-2xl p4">
      <div class="component-container__main">
        <el-form
          ref="dataFormRef"
          :rules="rules"
          :model="goodsInfo"
          label-width="120px"
        >
          <el-form-item label="商品名称" prop="name">
            <el-input v-model="goodsInfo.name" style="width: 400px" />
          </el-form-item>
          <el-form-item label="商品分类" prop="categoryId">
            <el-select
              v-model="goodsInfo.categoryId"
              style="width: 400px"
              clearable
            >
              <el-option
                v-for="item in categoryOptions"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              />
            </el-select>
          </el-form-item>

          <el-form-item label="商品产地" prop="originPlace">
            <el-input v-model="goodsInfo.originPlace" style="width: 400px" />
          </el-form-item>

          <el-form-item label="商品重量" prop="weight">
            <el-input v-model="goodsInfo.weight" style="width: 400px">
              <template #append>斤</template>
            </el-input>
          </el-form-item>

          <el-form-item label="商品等级" prop="level">
            <el-input v-model="goodsInfo.level" style="width: 400px" />
          </el-form-item>

          <el-form-item label="价格" prop="price">
            <el-input v-model="goodsInfo.price" style="width: 400px" />
          </el-form-item>

          <el-form-item label="优惠价" prop="discountPrice">
            <el-input v-model="goodsInfo.discountPrice" style="width: 400px" />
          </el-form-item>

          <el-form-item label="商品相册">
            <el-card
              v-for="(item, index) in pictures"
              :key="index"
              style="
                width: 170px;
                display: inline-block;
                margin-left: 10px;
                text-align: center;
              "
              :body-style="{ padding: '10px' }"
            >
              <single-upload v-model="item.url" :show-close="true" />

              <div v-if="item.url">
                <el-link v-if="index === 0" type="danger" class="button"
                  >商品主图</el-link
                >
                <el-link
                  v-else
                  type="info"
                  class="button"
                  @click="changeMainPicture(index)"
                  >设为主图</el-link
                >
              </div>

              <div v-else>
                <!-- 占位 -->
                <el-link type="info" />
              </div>
            </el-card>
          </el-form-item>

          <el-form-item label="商品介绍">
            <el-input
              v-model="goodsInfo.desc"
              class=""
              type="textarea"
              :rows="25"
              :autosize="{ minRows: 10, maxRows: 90 }"
            />
          </el-form-item>
        </el-form>
        <div class="flex justify-end">
          <el-button type="primary" @click="onshelf">上架</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed, onMounted, reactive, ref, toRefs } from 'vue';
  import { ElForm, ElMessage, ElMessageBox } from 'element-plus';

  // API 依赖
  import { listCategory } from '@/api/category';
  import { type GoodsRecord, onshelfGoods, getGoodsById } from '@/api/goods';

  // 自定义组件依赖
  import SingleUpload from '@/components/single-upload/index.vue';
  import { useRouter } from 'vue-router';

  //   const emit = defineEmits(['prev', 'next', 'update:modelValue']);
  const dataFormRef = ref(ElForm);
  type PartialGoods = Partial<GoodsRecord>;
  //   const props = defineProps({
  //     modelValue: {
  //       type: Object,
  //       default: () => ({
  //         name: '',
  //         categoryId: '',

  //         price: '',
  //         dsicountPrice: '',
  //         desc: '',
  //         detail: '',
  //         pictures: [],
  //       }),
  //     },
  //   });

  //   const goodsInfo: any = computed({
  //     get: () => props.modelValue,
  //     set: (value) => {
  //       emit('update:modelValue', value);
  //     },
  //   });

  const goodsInfo = ref<PartialGoods>({
    id: undefined,
    name: '',
    categoryId: '',
    price: undefined,
    discountPrice: undefined,
    desc: '',
    stock: undefined,
    coverImgUrl: undefined,
    scollImages: [],
  });

  const state = reactive({
    categoryOptions: [] as Array<any>,
    // 商品图册
    pictures: [
      { url: undefined },
      { url: undefined },
      { url: undefined },
      { url: undefined },
      { url: undefined },
    ] as Array<any>,
    rules: {
      name: [{ required: true, message: '请填写商品名称', trigger: 'blur' }],
      price: [{ required: true, message: '请填写价格', trigger: 'blur' }],
      //   discountPrice: [
      //     { required: true, message: '请填写优惠价', trigger: 'blur' },
      //   ],
      categoryId: [
        { required: true, message: '请选择商品分类', trigger: 'blur' },
      ],
    },
  });

  const { categoryOptions, pictures, rules } = toRefs(state);
  function onshelf() {
    console.log(goodsInfo.value);
    dataFormRef.value.validate((valid: any) => {
      if (valid) {
        ElMessageBox.confirm('是否确认上架该商品?', '确认', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }).then(() => {
          // 商品图片
          const coverImgUrl = state.pictures[0]?.url;
          if (coverImgUrl) {
            goodsInfo.value.coverImgUrl = coverImgUrl;
          }
          const scollImages = state.pictures
            .filter((item) => item.main === false && item.url)
            .map((item) => item.url);
          if (scollImages && scollImages.length > 0) {
            goodsInfo.value.scollImages = scollImages;
          }

          onshelfGoods(goodsInfo.value).then(() => {
            ElMessage.success('上架成功');
          });
        });
      }
    });
  }

  const router = useRouter();
  function loadData() {
    listCategory().then(({ data }) => {
      state.categoryOptions = data;
    });
    const { ...othersQuery } = router.currentRoute.value.query;
    console.log(othersQuery);
    const goodsId = othersQuery?.goodsId as string;
    if (goodsId) {
      getGoodsById(goodsId).then((resp) => {
        goodsInfo.value = resp.data as PartialGoods;
        const mainPicUrl = goodsInfo.value.coverImgUrl;
        if (mainPicUrl) {
          state.pictures.filter((item) => item.main)[0].url = mainPicUrl;
        }
        const { scollImages } = goodsInfo.value;
        if (scollImages && scollImages.length > 0) {
          for (let i = 1; i <= scollImages.length; i += 1) {
            state.pictures[i].url = scollImages[i - 1];
          }
        }
      });
    }
  }

  /**
   * 切换主图
   */
  function changeMainPicture(changeIndex: number) {
    const currMainPicture = JSON.parse(JSON.stringify(state.pictures[0]));
    const nextMainPicture = JSON.parse(
      JSON.stringify(state.pictures[changeIndex])
    );

    state.pictures[0].url = nextMainPicture.url;
    state.pictures[changeIndex].url = currMainPicture.url;
  }

  onMounted(() => {
    loadData();
  });
</script>

<style lang="scss" scoped>
  .container {
    padding: 0 20px 20px 20px;
  }
  .component-container {
    &__main {
      margin: 20px auto;

      .button {
        margin-left: 10px;
      }
    }

    &__footer {
      position: fixed;
      bottom: 20px;
      right: 20px;
    }
  }
</style>
