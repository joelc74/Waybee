module.exports = (sequelize, Sequelize) => {
    const Notificacion = sequelize.define("notificacion", {
        id_usuario_notif: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        id_usuario: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: 'usuario',
                key: 'id_usuario'
            }
        },
        
        notificacion: {
            type: Sequelize.TEXT,
            allowNull: false
        }
        
        
        
    }, {
        tableName: "notificacion",
        timestamps: false,
        indexes: [
            {
                unique: true,
                fields: ['id_usuario']  
            }
           
        ]
    });

       Notificacion.associate = function(models) {
        Notificacion.belongsTo(models.usuario, {
            foreignKey: 'id_usuario',
            as: 'usuario'
        });
        
    };
    
    return Notificacion;
};