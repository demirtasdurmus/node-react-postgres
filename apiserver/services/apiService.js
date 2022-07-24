
class ApiService {
    constructor(query, queryString, searchFields = []) {
        this.query = query;
        this.queryString = queryString;
        this.searchFields = searchFields;
    }

    filter() {
        console.log("hdhhddhd", this.query)
        // // build queryObj and exclude fields for filtering
        // const queryObj = { ...this.queryString };

        // // extract searchTerm and remove unnecessary fields
        // const searchTerm = queryObj.searchTerm;
        // const excludedFields = ['page', 'sort', 'limit', 'fields', 'searchTerm'];
        // excludedFields.forEach(el => delete queryObj[el]);

        // // configure query to search for searchTerm in searchFields
        // const searchFields = this.searchFields;
        // if (searchTerm && searchFields.length) {
        //     const searchQuery = searchFields.map((field) => {
        //         return {
        //             [field]: {
        //                 $regex: searchTerm,
        //                 // add aption for incasesensitive search
        //                 $options: 'i'
        //             }
        //         }
        //     });
        //     Object.assign(queryObj, { $or: searchQuery });
        // };

        // // configure query for advanced filtering
        // let queryStr = JSON.stringify(queryObj);
        // queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
        // this.query = this.query.find(JSON.parse(queryStr));

        return this;
    }

    sort() {
        // configure query for sorting
        if (this.queryString.sort) {
            const sortBy = this.queryString.sort.split(',').join(' ');
            this.query = this.query.sort(sortBy);
        } else {
            this.query = this.query.sort('-createdAt');
        };

        return this;
    }

    limitFields() {
        // configure query for field limiting
        if (this.queryString.fields) {
            const fields = this.queryString.fields.split(',').join(' ');
            this.query = this.query.select(fields);
        } else {
            this.query = this.query.select('-__v');
        };

        return this;
    }

    paginate() {
        // configure query for pagination
        const page = this.queryString.page * 1 || 1;
        const limit = this.queryString.limit * 1 || 10;
        const skip = (page - 1) * limit;
        this.query = this.query.skip(skip).limit(limit);

        return this;
    }
};


module.exports = ApiService;
