import { sliderModel } from "../../models/slider/slider_model.js";

export const getSliderData = async (req, res) => {
  try {
    const slider = await sliderModel.findOne();

    return res.status(200).json(slider);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Something went wrong", error: error });
  }
};
