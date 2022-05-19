/* eslint-disable prettier/prettier */
import axios from 'axios';
import qs from 'query-string';

export interface GoodsRecord {
  id: string;
  name: string;
  coverImgUrl: string;
  price: number;
  discount: number;
  stock: number;
  descImgUrlList: string[];
  originPlace: string;
  level: string;
  weight: number;
  desc: string;
  categoryId: string;
}

export interface GoodsParams extends Partial<GoodsRecord> {
  page: number;
  pageSize: number;
}

export interface GoodsListRes {
  content: GoodsRecord[];
  total: number;
}

export function listGoodsPages(shopId: string, params: GoodsParams) {
  return axios.get<GoodsListRes>(`/goods/shopId/${shopId}`, {
    params,
    paramsSerializer: (obj) => {
      return qs.stringify(obj);
    },
  });
}

export function deleteGoods(id: string) {
  return axios.delete(`/goods/${id}`);
}
