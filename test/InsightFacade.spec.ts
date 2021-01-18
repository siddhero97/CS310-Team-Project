import {expect} from "chai";
import * as fs from "fs-extra";
import {InsightDataset, InsightDatasetKind, InsightError, NotFoundError} from "../src/controller/IInsightFacade";
import InsightFacade from "../src/controller/InsightFacade";
import Log from "../src/Util";
import TestUtil from "./TestUtil";
import * as JSZip from "jszip";
import ReadWriteDisk from "../src/model/ReadWriteDisk";

// This should match the schema given to TestUtil.validate(..) in TestUtil.readTestQueries(..)
// except 'filename' which is injected when the file is read.
export interface ITestQuery {
    title: string;
    query: any;  // make any to allow testing structurally invalid queries
    isQueryValid: boolean;
    result: any;
    filename: string;  // This is injected when reading the file
}
/*
describe("InsightFacade Add/Remove Dataset", function () {
    // Reference any datasets you've added to test/data here and they will
    // automatically be loaded in the 'before' hook.
    const datasetsToLoad: { [id: string]: string } = {
        courses: "./test/data/courses.zip",
        twoBasicValid: "./test/data/twoBasicValid.zip",
        oneValidInvalid: "./test/data/oneValidInvalid.zip",
        notZipText: "./test/data/notZipText.txt",
        notCourses: "./test/data/notCourses.zip",
        course_s: "./test/data/course_s.zip",
        noJson: "./test/data/noJson.zip",
        invalidJson: "./test/data/invalidJson.zip",
        comm492b: "./test/data/comm492b.zip",
        invalidSectionNoYear: "./test/data/invalidSectionNoYear.zip"
    };
    let datasets: { [id: string]: string } = {};
    let insightFacade: InsightFacade;
    const cacheDir = __dirname + "/../data";

    before(function () {
        // This section runs once and loads all datasets specified in the datasetsToLoad object
        // into the datasets object
        Log.test(`Before all`);
        for (const id of Object.keys(datasetsToLoad)) {
            datasets[id] = fs.readFileSync(datasetsToLoad[id]).toString("base64");
        }
    });

    beforeEach(function () {
        // This section resets the data directory (removing any cached data) and resets the InsightFacade instance
        // This runs before each test, which should make each test independent from the previous one
        Log.test(`BeforeTest: ${this.currentTest.title}`);
        try {
            fs.removeSync(cacheDir);
            fs.mkdirSync(cacheDir);
            insightFacade = new InsightFacade();
        } catch (err) {
            Log.error(err);
        }
    });

    after(function () {
        Log.test(`After: ${this.test.parent.title}`);
    });

    afterEach(function () {
        Log.test(`AfterTest: ${this.currentTest.title}`);
    });

    // Test adding valid datasets
    it("should add multiple valid datasets", () => {
        const ids: string[] = ["courses", "oneValidInvalid", "twoBasicValid", "comm492b"];
        const addDatasetCalls: Array<Promise<string[]>> =
            ids.map((id: string) => {
                return insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Courses);
            });
        return Promise.all(addDatasetCalls)
            .then(() => {
                return insightFacade.listDatasets();
            })
            .then((addedDatasets: InsightDataset[]) => {
                addedDatasets.map((dataset: InsightDataset) => expect(ids.includes(dataset.id)).to.equal(true));
            })
            .catch((err: any) => {
                expect.fail(err, ids, `should not have failed with error: ${err}`);
            });
    });

    // Test adding 2 datasets together
    describe("Valid datasets should remain", function () {

        it("2 sets of successful adds should remain", function () {
            return insightFacade.addDataset("courses", datasets["courses"], InsightDatasetKind.Courses)
                .then((result: string[]) => {
                return insightFacade.addDataset("oneValidInvalid", datasets["oneValidInvalid"],
                    InsightDatasetKind.Courses);
            }).then((response: string[]) => {
                expect(response).to.deep.equal(["courses", "oneValidInvalid"]);
            }).catch((error: any) => {
                expect.fail(error, ["courses", "oneValidInvalid"], "Should not have rejected ids");
            });
        });
    });

    describe("Valid datasets should remain", function () {

        it("2 sets of successful adds should remain", function () {
            return insightFacade.addDataset("twoBasicValid", datasets["twoBasicValid"], InsightDatasetKind.Courses)
                .then((result: string[]) => {
                    return insightFacade.addDataset("oneValidInvalid", datasets["oneValidInvalid"],
                        InsightDatasetKind.Courses);
                }).then((response: string[]) => {
                    expect(response).to.deep.equal(["twoBasicValid", "oneValidInvalid"]);
                }).catch((error: any) => {
                    expect.fail(error, ["twoBasicValid", "oneValidInvalid"], "Should not have rejected ids");
                });
        });
    });

    it("add one dataset", function () {
        let zip = new JSZip();
        return insightFacade.addDataset("twoBasicValid", datasets["twoBasicValid"], InsightDatasetKind.Courses)
            .then((result: string[]) => {
                expect(result).to.deep.equal(["twoBasicValid"]);
            }).catch((error: any) => {
                expect.fail(error, ["twoBasicValid"], "Should not have rejected id");
            });
    });

    it("add course dataset", function () {
        return insightFacade.addDataset("courses", datasets["courses"], InsightDatasetKind.Courses)
            .then((result: string[]) => {
                expect(result).to.deep.equal(["courses"]);
            }).catch((error: any) => {
                expect.fail(error, ["courses"], "Should not have rejected id");
            });
    });

    it("add oneValidInvalid dataset", function () {
        return insightFacade.addDataset("oneValidInvalid",
            datasets["oneValidInvalid"], InsightDatasetKind.Courses)
            .then((result: string[]) => {
                expect(result).to.deep.equal(["oneValidInvalid"]);
            }).catch((error: any) => {
                expect.fail(error, ["oneValidInvalid"], "Should not have rejected id");
            });
    });

    it( " invalid data throws InsightError", function () {
        return insightFacade.addDataset("invalidSectionNoYear", datasets["invalidSectionNoYear"],
            InsightDatasetKind.Courses)
            .then((result: string[]) => {
                expect.fail(result, InsightError, "Should throw error");
            }).catch((err: any) => {
                expect(err).to.a.instanceOf(InsightError);
            });
    });

    // Test invalid zip in adding
    describe("Invalid zip on add throws InsightError", function () {
        const ids: string[] = ["course_s", "notZipText", "notCourses", "noJson", "invalidJson", "invalidSectionNoYear"];
        for (const id of ids) {
            it("id: '" + id + "'" + " throws InsightError", function () {
                return insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Courses)
                    .then((result: string[]) => {
                        expect.fail(result, InsightError, "Should throw error");
                    }).catch((err: any) => {
                        expect(err).to.a.instanceOf(InsightError);
                    });
            });
        }
    });

    // Test listDatasets added valid sets
    describe("All datasets should remain", function () {
        const coursesInsight: InsightDataset = {id: "courses", numRows: 64612, kind: InsightDatasetKind.Courses};
        const oneInsight: InsightDataset = {id: "oneValidInvalid", numRows: 5, kind: InsightDatasetKind.Courses};
        const expected: InsightDataset[] = [coursesInsight, oneInsight];
        it("2 valid adds should remain", function () {
            return insightFacade.addDataset("courses", datasets["courses"], InsightDatasetKind.Courses)
                .then((result: string[]) => {
                    return insightFacade.addDataset("oneValidInvalid", datasets["oneValidInvalid"],
                        InsightDatasetKind.Courses).then((result2: string[]) => {
                        return insightFacade.listDatasets();
                    }).then((response: InsightDataset[]) => {
                        expect(response).to.deep.equal(expected);
                    }).catch((error: any) => {
                        expect.fail(error, expected, "Datasets should remain with call to listDatasets");
                    });
                }).catch((error: any) => {
                    expect.fail(error, expected, "Datasets should be added");
                });
        });
    });

    describe("Valid dataset should remain", function () {
        const expected: InsightDataset[] = [{id: "courses", numRows: 64612, kind: InsightDatasetKind.Courses}];
        it("only valid add should remain", function () {
            return insightFacade.addDataset("courses", datasets["courses"], InsightDatasetKind.Courses)
                .then((result: string[]) => {
                    return insightFacade.addDataset("notCourses", datasets["notCourses"],
                        InsightDatasetKind.Courses)
                        .then((result2: string[]) => {
                            expect.fail(result2, InsightError, "Should throw error");
                        }).catch(() => {
                            return insightFacade.listDatasets();
                            }).then((response: InsightDataset[]) => {
                                expect(response).to.deep.equal(expected);
                            }).catch((error: any) => {
                                expect.fail(error, expected, "Datasets should remain with call to listDatasets");
                        });
                }).catch((error: any) => {
                    expect.fail(error, expected, "Valid datasets should be added");
                });
        });
    });

    // Empty dataset to start
    describe("Dataset should begin as empty", function () {
        it("should have empty dataset", function () {
            return insightFacade.listDatasets().then((response: InsightDataset[]) => {
                expect(response).to.deep.equal([]);
            }).catch((error: any) => {
                expect.fail(error, [], "Dataset should be empty");
            });
        });
    });

    // Test invalid content in adding
    describe("Invalid content in adding", function () {
        const contents: string[] = [undefined, null];
        for (const content of contents) {
            it("content type:" + content + "  throws InsightError", function () {
                return insightFacade.addDataset("courses", content, InsightDatasetKind.Courses)
                    .then((result: string[]) => {
                        expect.fail(result, InsightError, "Should throw error");
                    }).catch((err: any) => {
                        expect(err).to.a.instanceOf(InsightError);
                    });
            });
        }
    });

    // Test invalid id in adding
    describe("Invalid id on add throws InsightError", function () {
        const ids: string[] = ["   ", "", null, undefined];
        for (const id of ids) {
            it("id: '" + id + "'" + " throws InsightError", function () {
                return insightFacade.addDataset(id, datasets["courses"], InsightDatasetKind.Courses)
                    .then((result: string[]) => {
                        expect.fail(result, InsightError, "Should throw error");
                    }).catch((err: any) => {
                        expect(err).to.a.instanceOf(InsightError);
                    });
            });
        }
    });

    // Test invalid id in removing
    describe("Invalid id on remove throws InsightError", function () {
        const ids: string[] = ["course_s", "   ", "", undefined, null];
        for (const id of ids) {
            it("id: '" + id + "'" + " throws InsightError", function () {
                return insightFacade.removeDataset(id).then((result: string) => {
                        expect.fail(result, InsightError, "Should throw error");
                }).catch((err: any) => {
                    expect(err).to.a.instanceOf(InsightError);
                });
            });
        }
    });

    // Test add same id as previously added
    it("Should add a valid dataset and reject second attempt", function () {
        const id: string = "courses";
        return insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Courses).then((result: string[]) => {
                return insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Courses);
            }).then((response: string[]) => {
                expect.fail(response, InsightError, "Should throw error on second add");
            }).catch((error: any) => {
                expect(error).to.a.instanceOf(InsightError);
            });
    });

    // Test add ids different cases
    it("Should add both datasests", function () {
        const id1: string = "twoBasicValid";
        const id2: string = "TwoBasicValid";
        const expected: string[] = [id1, id2];
        return insightFacade.addDataset(id1, datasets[id1], InsightDatasetKind.Courses).then((result: string[]) => {
            return insightFacade.addDataset(id2, datasets[id1], InsightDatasetKind.Courses);
        }).then((response: string[]) => {
            expect(response).to.deep.equal(expected);
        }).catch((error: any) => {
            expect.fail(error, expected, "Different cases are different ids, should not be rejected");
        });
    });

//     // Test remove valid id
    it("Should remove previously added id", function () {
        const id: string = "courses";
        const expected: string = id;
        return insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Courses).then((result: string[]) => {
            return insightFacade.removeDataset(id);
        }).then((response: string) => {
            expect(response).to.deep.equal(expected);
            if (ReadWriteDisk.FileExistInData("d_courses1")) {
                expect.fail("file should be removed from disk");
            }
        }).catch((error: any) => {
            expect.fail(error, expected, "Should not have rejected remove");
        });
    });

    it("Add Remove Add", function () {
        const id1: string = "twoBasicValid";
        const id2: string = "oneValidInvalid";
        return insightFacade.addDataset(id1, datasets[id1], InsightDatasetKind.Courses).then(() => {
            return insightFacade.removeDataset(id1).then(() => {
                return insightFacade.addDataset(id2, datasets[id2], InsightDatasetKind.Courses).then(() => {
                    if (ReadWriteDisk.FileExistInData("d_twoBasicValid1")) {
                        expect.fail("file should be removed from disk");
                    }
                    if (!ReadWriteDisk.FileExistInData("d_oneValidInvalid1")) {
                        expect.fail("file should be loaded to disk");
                    }
                });
            });
        }).catch((error: any) => {
            expect.fail("", "", error);
        });
    });

//     // Test remove valid id not previously added
    it("Should throw NotFoundError", function () {
        const id: string = "courses";
        return insightFacade.removeDataset(id).then((result: string) => {
            expect.fail(result, NotFoundError, "Should have rejected remove");
        }).catch((err: any) => {
            expect(err).to.a.instanceOf(NotFoundError);
        });
    });
//
//     // Test remove valid id different case
    it("Should throw NotFoundError", function () {
        const id1: string = "twoBasicValid";
        const id2: string = "TwoBasicValid";
        return insightFacade.addDataset(id1, datasets[id1], InsightDatasetKind.Courses).then((result: string[]) => {
            return insightFacade.removeDataset(id2);
        }).then((response: string) => {
            expect.fail(response, NotFoundError, "Should have rejected remove, id in different case");
        }).catch((error: any) => {
            expect(error).to.a.instanceOf(NotFoundError);
        });
    });
});
*/
/*
 * This test suite dynamically generates tests from the JSON files in test/queries.
 * You should not need to modify it; instead, add additional files to the queries directory.
 * You can still make tests the normal way, this is just a convenient tool for a majority of queries.
 */
/*
describe("InsightFacade PerformQuery", () => {
    const datasetsToQuery: { [id: string]: any } = {
        courses: {id: "courses", path: "./test/data/courses.zip", kind: InsightDatasetKind.Courses},
        courses1:  {id: "courses1", path: "./test/data/courses1.zip", kind: InsightDatasetKind.Courses},
        // rooms: {id: "rooms", path: "./test/data/rooms.zip", kind: InsightDatasetKind.Rooms}
    };
    let insightFacade: InsightFacade = new InsightFacade();
    let testQueries: ITestQuery[] = [];
    const cacheDir = __dirname + "/../data";

    // Load all the test queries, and call addDataset on the insightFacade instance for all the datasets
    before(function () {
        Log.test(`Before: ${this.test.parent.title}`);

        try {
            fs.removeSync(cacheDir);
            fs.mkdirSync(cacheDir);
            insightFacade = new InsightFacade();
        } catch (err) {
            Log.error(err);
        }
        // Load the query JSON files under test/queries.
        // Fail if there is a problem reading ANY query.
        try {
            testQueries = TestUtil.readTestQueries("test/queries/courses");
        } catch (err) {
            expect.fail("", "", `Failed to read one or more test queries. ${err}`);
        }

        // Load the datasets specified in datasetsToQuery and add them to InsightFacade.
        // Will fail* if there is a problem reading ANY dataset.
        const loadDatasetPromises: Array<Promise<string[]>> = [];
        for (const key of Object.keys(datasetsToQuery)) {
            const ds = datasetsToQuery[key];
            const data = fs.readFileSync(ds.path).toString("base64");
            loadDatasetPromises.push(insightFacade.addDataset(ds.id, data, ds.kind));
        }

        return Promise.all(loadDatasetPromises);
    });

    beforeEach(function () {
        Log.test(`BeforeTest: ${this.currentTest.title}`);
    });

    after(function () {
        Log.test(`After: ${this.test.parent.title}`);
    });

    afterEach(function () {
        Log.test(`AfterTest: ${this.currentTest.title}`);
    });

    // Dynamically create and run a test for each query in testQueries
    // Creates an extra "test" called "Should run test queries" as a byproduct. Don't worry about it
    it("Should run test queries", function () {
        describe("Dynamic InsightFacade PerformQuery tests", function () {
            for (const test of testQueries) {
                it(`[${test.filename}] ${test.title}`, function (done) {
                    insightFacade.performQuery(test.query).then((result) => {
                        TestUtil.checkQueryResult(test, result, done);
                    }).catch((err) => {
                        TestUtil.checkQueryResult(test, err, done);
                    });
                });
            }
        });
    });
});
 */
