#import "NVTabBarView.h"
#import "NVTabBarItemView.h"

#import <UIKit/UIKit.h>
#import <React/UIView+React.h>

@implementation NVTabBarView
{
    UITabBarController *_tabBarController;
}

- (id)init
{
    if (self = [super init]) {
        _tabBarController = [[UITabBarController alloc] init];
        [self addSubview:_tabBarController.view];
        _tabBarController.delegate = self;
    }
    return self;
}

- (void)didSetProps:(NSArray<NSString *> *)changedProps
{
    [super didSetProps:changedProps];
    if ([changedProps containsObject:@"barTintColor"]) {
        [self.tabBarController.tabBar setBarTintColor:self.barTintColor];
    }
    if ([changedProps containsObject:@"tintColor"]) {
        [self.tabBarController.tabBar setTintColor: self.tintColor];
    }
    if ([changedProps containsObject:@"unselectedTintColor"]) {
        [self.tabBarController.tabBar setUnselectedItemTintColor: self.unselectedTintColor];
    }
    if ([changedProps containsObject:@"isTranslucent"]) {
        [self.tabBarController.tabBar setIsTranslucent: self.isTranslucent];
    }
}

- (void)insertReactSubview:(UIView *)subview atIndex:(NSInteger)atIndex
{
    [super insertReactSubview:subview atIndex:atIndex];
    [_tabBarController addChildViewController:[(NVTabBarItemView *) subview navigationController]];
}

- (void)removeReactSubview:(UIView *)subview
{
    NSInteger tab = [self.reactSubviews indexOfObject:subview];
    [super removeReactSubview:subview];
    NSMutableArray *controllers = [NSMutableArray arrayWithArray:[_tabBarController viewControllers]];
    [controllers removeObjectAtIndex:tab];
    [_tabBarController setViewControllers:controllers];
}

- (void)didUpdateReactSubviews
{
}

- (void)layoutSubviews
{
    [super layoutSubviews];
    _tabBarController.view.frame = self.bounds;
}

- (void)dealloc
{
    _tabBarController.delegate = nil;
}

- (void)tabBarController:(UITabBarController *)tabBarController didSelectViewController:(nonnull UIViewController *)viewController
{
    NSUInteger tab = [tabBarController.viewControllers indexOfObject:viewController];
    NVTabBarItemView *tabBarItem = (NVTabBarItemView *)self.reactSubviews[tab];
    if (!!tabBarItem.onPress) {
        tabBarItem.onPress(nil);
    }
}

@end
