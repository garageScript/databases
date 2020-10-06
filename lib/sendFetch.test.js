jest.mock("node-fetch");
const fetch = require("node-fetch");
const { sendFetch } = require("./sendFetch");

fetch.mockReturnValue(
  Promise.resolve({
    json: () => {},
  })
);
describe("sendFetch function", () => {
  test("should not call fetch function if no path is provided", async () => {
    await sendFetch();
    expect(fetch).toHaveBeenCalledTimes(0);
  });
  test("should call fetch function just one time", async () => {
    await sendFetch("hi", "hi", "hi", "hi");
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toBeCalledWith("hi", {
      method: "hi",
      body: '"hi"',
      headers: {
        "content-type": "application/json",
        authorization: "hi",
      },
    });
  });
  test("should should not have authorization in fetch request if authorization \
	parameter is not passed in", async () => {
    await sendFetch("hi", "hi", "hi");
    expect(fetch).toBeCalledWith("hi", {
      method: "hi",
      body: '"hi"',
      headers: {
        "content-type": "application/json",
      },
    });
  });
  test("should should not have body in fetch request if body \
	parameter is not not valid", async () => {
    await sendFetch("hi", "hi");
    expect(fetch).toBeCalledWith("hi", {
      method: "hi",
      headers: {
        "content-type": "application/json",
      },
    });
  });
});
