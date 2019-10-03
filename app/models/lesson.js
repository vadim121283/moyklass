module.exports = (sequelize, DataTypes) => {
    const Lesson = sequelize.define('Lesson', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        date: {
            type: DataTypes.DATE,
            allowNull: false,
            validate: {
                isDate: true,
            },
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: true,
                len: [1, 100]
            }
        },
        status: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
    },{
        sequelize,
        underscored: true,
        tableName: 'lessons',
    });

    Lesson.associate = function(models) {
        models.Lesson.belongsToMany(models.Teacher, {through: 'lesson_teachers'});
        models.Lesson.belongsToMany(models.Student, {through: 'LessonStudents'});
    };

    return Lesson;
};
