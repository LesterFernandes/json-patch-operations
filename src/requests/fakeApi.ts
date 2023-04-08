import { baseObj, baseObj2, patch2, patch } from "../../data";

const wait = () => new Promise((resolve) => {
    setTimeout(() => {
        resolve('done');
    }, 500)
})

export async function fetchBaseJson() {
    await wait();
    // return baseObj;
    return baseObj2;
}

export async function fetchPatchJson() {
    await wait();
    // return patch
    return patch2;
}