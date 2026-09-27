import { useNavigation } from 'react-router';
// import { useEffect, useState } from 'react';
import { useEffect } from 'react';
import { showLoadingBar as show, hideLoadingBar as _hide } from './TopLoadingBar';

function hide(wait: number, cancel: boolean) {
    if (cancel) return;
    setTimeout(() => {
        _hide();
    }, wait);
}

export default function Loading({ wait = 655, hasOtherLoadingJob = false }: { wait?: number, hasOtherLoadingJob?: boolean }) {
    const navigation = useNavigation();

    useEffect(() => {
        show();
        console.log("fired show at mount")
        window.scrollTo({ top: 0, behavior: "smooth" });
        hide(wait, hasOtherLoadingJob);
        return () => {
            if (localStorage.getItem("loading-autoStop") !== "true") {
                show();
                console.log("fired show at uninstall");
            }
        }
    }, []); // eslint-disable-line

    useEffect(() => {
        if (navigation.state == "idle") hide(wait, hasOtherLoadingJob);
    }, [navigation.state]); // eslint-disable-line

    return null;
};