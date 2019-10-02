module.exports = (sequelize, DataTypes) => {
    const Teacher = sequelize.define('Teacher', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: true,
                len: [1, 10]
            }
        }
    },{
        sequelize,
        underscored: true,
        tableName: 'teachers',
    });

    Teacher.associate = function(models) {
        models.Teacher.belongsToMany(models.Lesson, {through: 'lesson_teachers'});
    };

    return Teacher;
};
