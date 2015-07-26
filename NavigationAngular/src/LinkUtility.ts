﻿import Navigation = require('navigation');
import angular = require('angular');
import jquery = require('jquery');

class LinkUtility {
    static setLink(element: ng.IAugmentedJQuery, attrs: ng.IAttributes, linkAccessor: () => string) {
        try {
            attrs.$set('href', Navigation.settings.historyManager.getHref(linkAccessor()));
        } catch (e) {
            attrs.$set('href', null);
        }
    }

    static getData(toData, includeCurrentData: boolean, currentDataKeys: string): any {
        if (currentDataKeys)
            toData = Navigation.StateContext.includeCurrentData(toData, currentDataKeys.trim().split(/\s*,\s*/));
        if (includeCurrentData)
            toData = Navigation.StateContext.includeCurrentData(toData);
        return toData;
    }

    static isActive(key: string, val: any): boolean {
        if (!Navigation.StateContext.state)
            return false;
        if (val != null && val.toString()) {
            var trackTypes = Navigation.StateContext.state.trackTypes;
            var currentVal = Navigation.StateContext.data[key];
            return currentVal != null && (trackTypes ? val === currentVal : val.toString() == currentVal.toString());
        }
        return true;
    }

    static setActive(element: ng.IAugmentedJQuery, attrs: ng.IAttributes, active: boolean, activeCssClass: string, disableActive: boolean) {
        element.toggleClass(activeCssClass, active);
        if (active && disableActive)
            attrs.$set('href', null);
    }

    static addListeners(element: ng.IAugmentedJQuery, setLink: () => void, $parse: ng.IParseService, attrs: ng.IAttributes, scope: ng.IScope) {
        var lazy = !!scope.$eval(attrs['lazy']);
        element.on('click', (e: JQueryEventObject) => {
            var anchor = <HTMLAnchorElement> element[0];
            if (lazy)
                setLink();
            if (!e.ctrlKey && !e.shiftKey && !e.metaKey && !e.altKey && !e.button) {
                if (anchor.href) {
                    var link = Navigation.settings.historyManager.getUrl(anchor);
                    var navigating = this.getNavigating($parse, attrs, scope);
                    if (navigating(e, link)) {
                        e.preventDefault();
                        Navigation.StateController.navigateLink(link);
                    }
                }
            }
        });
        if (!lazy) {
            Navigation.StateController.onNavigate(setLink);
            element.on('$destroy', () => Navigation.StateController.offNavigate(setLink));
        } else {
            element.on('mousedown', (e) => setLink());
            element.on('contextmenu', (e) => setLink());
        }
    }

    static getNavigating($parse: ng.IParseService, attrs: ng.IAttributes, scope: ng.IScope): (e: JQueryEventObject, link: string) => boolean {
        return (e: JQueryEventObject, link: string) => {
            var listener = attrs['navigating'] ? $parse(attrs['navigating']) : null;
            if (listener)
                return listener(scope, { $event: e, url: link });
            return true;
        }
    }
}
export = LinkUtility; 