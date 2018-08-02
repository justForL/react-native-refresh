
import React, {Component} from 'react';

import PropTypes from 'prop-types';

import {
    ScrollView,
    RefreshControl,
    FlatList,
    View,
    Text,
} from 'react-native';

export interface SMRefreshFlatListViewConfig {
    /// 下拉刷新正常标题
    normalRefreshTitle: string;
    /// 正在刷新时的标题
    refreshingTitle: string;
}

export default class SMRefreshFlatListView extends Component {

    static defaultProps = {
        noMoreData: false,
        refresh: {
            normalRefreshTitle: '下拉加载',
            refreshingTitle: '加载中',
        }
    };

    static propTypes = {
        ...FlatList.propTypes,
        /// (begin: ()=>void)=>void
        beginRefresh: PropTypes.func,
        /// (end: ()=>void)=>void
        onRefresh: PropTypes.func.isRequired,
        /// 是否没有更多数据了
        noMoreData: PropTypes.bool,
        /// (end: ()=>void)=>void
        onLoading: PropTypes.func,
        /// 刷新配置
        refresh: PropTypes.object,
    };

    loading: boolean = false;

    constructor(props) {
        super(props);
        this.state = {
            /// 刷新对象，尽量对 state 减少不必要的影响
            /// 减少对 state 的值插入
            refresh: {
                isRefreshing: false,
                title: this.props.refresh.normalRefreshTitle,
                loading: false,
                noMoreData: false,
            }
        };
    }

    componentWillReceiveProps(props) {
        let refresh = this.state.refresh;
        refresh.noMoreData = props.noMoreData;
        this.setState({
            refresh: refresh,
        })
    }

    componentDidMount() {
        /// 如果子类重写 componentDidMount ，子类必须调用 sm_componentDidMount
        this.sm_componentDidMount()
    }

    /// 接受新的属性
    sm_componentDidMount() {
        if (this.props.beginRefresh) {
            this.props.beginRefresh(() => {
                this._onRefresh();
            });
        }
    }

    _onRefresh() {
        if (this.state.refresh.isRefreshing) {
            return;
        }
        let refresh = this.state.refresh;
        refresh.isRefreshing = true;
        this.setState({
            refresh: refresh
        });
        if (this.props.onRefresh) {
            this.props.onRefresh(()=>{
                let refresh = this.state.refresh;
                refresh.isRefreshing = false;
                this.setState({
                    refresh: refresh,
                });
            })
        }
    }

    _onEndReached(info) {
        /// 没有更多数据，不会掉
        if (this.props.noMoreData) {
            return;
        }
        /// 通过 state.loading 不保险，有时间差
        /// 需要瞬间锁掉
        if (this.loading) {
            return;
        }
        this.loading = true;
        let refresh = this.state.refresh;
        refresh.loading = true;
        this.setState({
            refresh: refresh,
        });
        if (this.props.onLoading) {
            this.props.onLoading(()=>{
                let refresh = this.state.refresh;
                refresh.loading = false;
                this.setState({
                    refresh: refresh,
                }, ()=>{
                    /// 当回调完成时才会解锁
                    this.loading = false;
                });
            })
        }
    }

    _onScroll(evt) {

        let size = evt.nativeEvent.layoutMeasurement;
        let contentSize = evt.nativeEvent.contentSize;
        let offset = evt.nativeEvent.contentOffset;

        /// 必须是上拉才会考虑计算
        if (offset.y < 0) {
            return;
        }

        /// 内容比高度还小
        if (contentSize.height < size.height) {
            if (offset.y > 30) {
                this._onEndReached();
            }
            return;
        }

        /// 隐藏在屏幕外的距离
        let x = contentSize.height - (offset.y + size.height);

        if (x < 30) {
            this._onEndReached();
        }
    }

    _footTitle() {

        if (this.props.noMoreData) {
            return "没有更多数据了";
        } else if (this.state.refresh.loading) {
            return '加载中...';
        } else {
            return this._dataCount() ? '上拉加载更多' : '';
        }
    }

    _dataCount() {
        if (this.props.data && this.props.data.length) {
            return this.props.data.length;
        }
        return 0;
    }

    _footHeight() {
        return (this.props.hasOwnProperty('noMoreData') && this.props.hasOwnProperty('onLoading')) ? 30 : 0
    }

    render() {
        let onRefresh = this.props.onRefresh ? ()=>{this._onRefresh()} : null;
        let onScroll = this.props.onLoading ? (evt)=>{this._onScroll(evt)} : null;
        return (
            <FlatList {...this.props}
                      onScroll={onScroll}
                      refreshing={this.state.refresh.isRefreshing}
                      onRefresh={onRefresh}
                      ListFooterComponent={
                          <View style={{alignItems: 'stretch',}}>
                              {this.props.ListFooterComponent}
                              <View style={{height: this._footHeight(), alignItems: 'center', justifyContent: 'center', overflow: 'hidden',}}>
                                  <Text>{this._footTitle()}</Text>
                              </View>
                          </View>
                      }
            />
        )
    }

}