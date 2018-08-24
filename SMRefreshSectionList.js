
import React, {Component} from 'react';

import PropTypes from 'prop-types';

import {
    View,
    Text,
    SectionList, Vibration,
} from 'react-native';

import SMEmptyView from "./SMEmptyView";

import {vibrate} from '@shenmajr/shenmajr-react-native-systemapi';

export default class SMRefreshSectionList extends Component {

    static defaultProps = {
        noMoreData: false,
    };

    static propTypes = {
        ...SectionList.propTypes,
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

        /// 空视图
        emptyView: PropTypes.element,
        /// 空视图默认视图
        emptyDefaultView: PropTypes.shape({
            /// 样式
            style: PropTypes.object,
            /// 空视图图片
            emptyImage: PropTypes.any,
            /// 空视图标题
            emptyTitle: PropTypes.shape({
                title: PropTypes.string,
                titleStyle: PropTypes.object,
            }),
            /// 空视图副标题
            emptySubTitle: PropTypes.shape({
                title: PropTypes.string,
                titleStyle: PropTypes.object,
            }),
            /// 空视图按钮
            emptyButton: PropTypes.shape({
                style: PropTypes.object,
                title: PropTypes.string,
                titleStyle: PropTypes.object,
            })
        })
    };

    loadingLock: boolean = false;

    lastLoadingTime: number;

    constructor(props) {
        super(props);
        this.state = {
            /// 刷新对象，尽量对 state 减少不必要的影响
            /// 减少对 state 的值插入
            refresh: {
                isRefreshing: false,
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
        if (this.loadingLock) {
            return;
        }
        this.loadingLock = true;
        let refresh = this.state.refresh;
        refresh.loading = true;
        this.setState({
            refresh: refresh,
        });
        if (this.props.onLoading) {
            this.lastLoadingTime = (new Date()).getTime();
            vibrate('light');
            this.props.onLoading(()=>{
                let refresh = this.state.refresh;
                refresh.loading = false;
                this.setState({
                    refresh: refresh,
                }, ()=>{
                    let now = (new Date()).getTime();
                    if ((now - this.lastLoadingTime) < 2000) {
                        let timer = setTimeout(()=>{
                            clearTimeout(timer);
                            this.loadingLock = false;
                        }, 2000 - (now - this.lastLoadingTime));
                        return;
                    }
                    /// 当回调完成时才会解锁
                    this.loadingLock = false;
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
        if (this.props.sections && this.props.sections.length) {
            return this.props.sections.length;
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
            <SectionList {...this.props}
                      onScroll={onScroll}
                      refreshing={this.state.refresh.isRefreshing}
                      onRefresh={onRefresh}
                      ListFooterComponent={
                          <View style={{alignItems: 'stretch',}}>
                              {this.props.ListFooterComponent}
                              {this._footer()}
                          </View>
                      }
            />
        )
    }

    /// 足部
    _footer() {
        let count = this._dataCount();
        if (count === 0) {
            if (this.props.hasOwnProperty('emptyView')) {
                return this.props.emptyView;
            } else if (this.props.hasOwnProperty('emptyDefaultView')) {
                return <SMEmptyView {...this.props.emptyDefaultView} style={[{}, this.props.emptyDefaultView.style]}/>
            }
            return this._loadMoreView()
        } else {
            return this._loadMoreView();
        }
    }

    _loadMoreView() {
        let height = this._footHeight();
        if (height === 0) {
            return <View/>
        }
        return <View style={{height: height, alignItems: 'center', justifyContent: 'center', overflow: 'hidden', }}>
            <Text>{this._footTitle()}</Text>
        </View>
    }
}